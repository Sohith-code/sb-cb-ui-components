import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { APP_DB_STORES, ConfigurationsService, IndexedDbService } from '@sunbird-cb/utils-v2'
import { Observable, from } from 'rxjs'

/**
 * The signed-in user's CBP/CVP plans for a financial year, backed by
 * POST /apis/proxies/v8/cbplan/v4/user/dictionary.
 *
 * Callers need one method — `getUserCbpPlansAsync(callApi, request)`. Everything else here
 * (plan year resolution, the API call, the transform, the cache) is an implementation
 * detail it drives, so a screen never has to know which of those steps ran.
 *
 * The API answers with plans keyed by planId inside `aparPlanList` / `nonAparPlanList`;
 * what gets cached and returned is the flattened, pre-split shape the UI actually renders:
 * three arrays (APAR, CBP, AI-CBP) with their counts, each plan stamped with its planYear.
 * Doing the split once here keeps every consumer from re-deriving it — and from
 * re-deciding what separates an AI-drafted plan from a regular one.
 *
 * The year is not guaranteed to be the one asked for: a user with no plans for the current
 * year gets an earlier year's back instead, under that year's key. The entry therefore
 * carries both — `planYear` for the year the data IS, `requestedPlanYear` for the year that
 * was asked (and the key it is cached under).
 *
 * Caching lives in the shared application database (iGotAppDB, owned by IndexedDbService).
 * Every read and write is bounded by IndexedDbService.withTimeout(): the cache is an
 * optimisation, so a database that is slow, blocked or unavailable degrades to a miss
 * rather than stalling the caller.
 */

const API_END_POINTS = {
  FETCH_USER_CBP_PLAN_DICTIONARY: '/apis/proxies/v8/cbplan/v4/user/dictionary',
}

const STORE_NAME = APP_DB_STORES.CBP_PLANS
const PLANS_MAP_STORE = APP_DB_STORES.PLANS_MAP
const PLANS_MAP_KEY = 'all'

/**
 * V4 entries are keyed by the bare plan year ('2026-27') — the same key CbpPlanCacheService
 * uses for its V3 entries in this same store, which hold a different shape.
 *
 * Sharing the key is deliberate, and it means neither service may assume the entry it reads
 * is its own: whichever wrote last owns the slot. Both sides therefore shape-check on read
 * (see isV4Entry below, and the mirror guard in CbpPlanCacheService.getEntry), so a foreign
 * entry reads as a cache miss and triggers a refetch instead of being handed to a caller
 * that cannot understand it. The cost is the two caches invalidating each other — correct
 * data, more requests — until one of them is retired or given a store of its own.
 */

/** `planType` marking a plan the AI drafted; anything else is an ordinary CBP plan. */
const AI_PLAN_TYPE = 'AICBP'

/** Default cache lifetime in seconds, matching CbpPlanCacheService's fallback. */
const DEFAULT_EXPIRY_SECONDS = 300

// ── Models ───────────────────────────────────────────────────────────────────

export interface IUserCbpPlanContent {
  identifier: string
  mandatory: boolean
}

export interface IUserCbpPlan {
  planId: string
  name: string
  endDate: string
  /** Stamped on by this service from the year the plan was fetched for. */
  planYear: string
  /**
   * Stamped on from the list the plan arrived in, because the API states it by placement
   * rather than by field. Carrying it makes a plan self-describing once it is out of that
   * list — CardTransformerService.resolvePlanType reads it to label the card APAR.
   */
  isApar: boolean
  planType: string | null
  contentList: IUserCbpPlanContent[]
  /**
   * Content id of the plan's comprehensive assessment, as the dictionary (and
   * /cbplan/v4/read/:id) now name it. Plans are cached verbatim, so read this first.
   */
  caLinkedId?: string | null
  /**
   * The dictionary's former name for `caLinkedId`. Kept only because an IndexedDB entry
   * written before the rename can still carry it — read `caLinkedId ?? comprehensiveAssessment`.
   */
  comprehensiveAssessment?: string | null
  createdByOrgId: string
  createdByOrgName: string
  createdByOrgLogo: string | null
}

/** What gets cached and returned: the API's two keyed maps, flattened and split by type. */
export interface IUserCbpPlanData {
  aparPlan: number
  cbpPlan: number
  aiCbpPlan: number
  aparPlanList: IUserCbpPlan[]
  cbpPlanList: IUserCbpPlan[]
  aiCbpPlanList: IUserCbpPlan[]
}

/**
 * The cached value: the data above plus the fields the cache itself needs.
 * Kept flat rather than wrapped in `{ data }` so what IndexedDB holds is the same shape
 * callers receive.
 */
export interface IUserCbpPlanCacheEntry extends IUserCbpPlanData {
  /**
   * The year the returned plans actually belong to, which is also what each plan in the
   * lists is stamped with. Usually the year that was asked for — but when the user has no
   * plans for that year the API answers with an earlier one instead, and this reports the
   * year the data really is, so a screen can say which year it is showing.
   */
  planYear: string
  /** The year that was asked for, and the key this entry is cached under. */
  requestedPlanYear: string
  cachedAt: number
}

export type TUserCbpPlanMapType = 'apar' | 'cbp' | 'aicbp'

export interface IUserCbpPlanMapEntry {
  planType: TUserCbpPlanMapType
  caLinkedId: string | null
  endDate: string
  planId: string
}

/** Request body under `request`. Unknown fields pass through to the API untouched. */
export interface IUserCbpPlanRequest {
  planYear?: string
  [key: string]: any
}

// ── Plan year config model (instanceConfig.cbpPlanYear) ──────────────────────

export interface IUserCbpPlanYearOption {
  label: string
  value: string
  current?: boolean
  editable?: boolean
}

export interface IUserCbpPlanYearConfig {
  currentYear: string
  yearList: IUserCbpPlanYearOption[]
}

@Injectable({
  providedIn: 'root',
})
export class UserCbpPlansService {

  /**
   * In-flight requests keyed by plan year, dropped as soon as the request settles.
   * Several strips can ask for the same year in the same tick on a cold cache; without
   * this each one would issue its own POST.
   */
  private inFlight = new Map<string, Promise<IUserCbpPlanCacheEntry>>()

  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService,
    private appDb: IndexedDbService,
  ) {}

  // ── Primary entry point ────────────────────────────────────────────────────

  /**
   * The user's plans for a year, served from IndexedDB while the cache is valid.
   *
   * @param callApi true bypasses the cache, calls the API and refreshes the cache with
   *   whatever comes back. False (the default) serves a valid cache entry when there is
   *   one and only calls the API otherwise.
   * @param request request body; `planYear` defaults to the configured current year, and
   *   any other field is forwarded to the API as-is.
   */
  async getUserCbpPlansAsync(callApi = false, request?: IUserCbpPlanRequest): Promise<IUserCbpPlanCacheEntry> {
    const planYear = (request && request.planYear) || this.getCurrentPlanYear()
    const cached = await this.getCacheEntry(planYear)

    if (!callApi && cached && this.isEntryValid(cached)) {
      return cached
    }

    // One POST per year in flight, however many callers arrive while it is running —
    // except when a caller explicitly asked for a fresh call, which must not be served
    // by a request that may have started before whatever prompted the refresh.
    const pending = this.inFlight.get(planYear)
    if (pending && !callApi) {
      return pending
    }

    const fetch = this.fetchAndCache(planYear, request, cached)
      .finally(() => {
        if (this.inFlight.get(planYear) === fetch) {
          this.inFlight.delete(planYear)
        }
      })
    this.inFlight.set(planYear, fetch)
    return fetch
  }

  /** Observable wrapper over getUserCbpPlansAsync, for the library's Observable callers. */
  getUserCbpPlans(callApi = false, request?: IUserCbpPlanRequest): Observable<IUserCbpPlanCacheEntry> {
    return from(this.getUserCbpPlansAsync(callApi, request))
  }

  // ── Plan year resolution ───────────────────────────────────────────────────

  /**
   * `instanceConfig.cbpPlanYear`, when the instance configures it.
   *
   * Read through a cast because NsInstanceConfig.IConfig does not declare `cbpPlanYear`
   * yet, and both consumers compile against the built @sunbird-cb/utils-v2 package —
   * adding the field to the model only takes effect once that package is rebuilt.
   */
  get planYearConfig(): IUserCbpPlanYearConfig | undefined {
    const instanceConfig: any = this.configSvc.instanceConfig
    return instanceConfig && instanceConfig.cbpPlanYear
  }

  /** Configured plan years, in the order the config lists them. Empty when unconfigured. */
  getPlanYearList(): IUserCbpPlanYearOption[] {
    const configured = this.planYearConfig && this.planYearConfig.yearList
    return Array.isArray(configured) ? configured : []
  }

  /**
   * The plan year to request when a caller names none.
   *
   * Config wins over the calendar: `currentYear`, then whichever option is flagged
   * `current`, and only then the computed financial year — an instance that has not
   * rolled over to the new year yet still gets the year its config says is current.
   */
  getCurrentPlanYear(): string {
    const config = this.planYearConfig
    if (config && config.currentYear) {
      return config.currentYear
    }
    const flagged = this.getPlanYearList().find((option: IUserCbpPlanYearOption) => option && option.current)
    if (flagged && flagged.value) {
      return flagged.value
    }
    return this.getCurrentFinancialYear()
  }

  /**
   * Financial year runs April -> March, formatted as YYYY-YY.
   * e.g. Aug 2026 -> '2026-27', Feb 2027 -> '2026-27'.
   */
  getCurrentFinancialYear(date: Date = new Date()): string {
    const month = date.getMonth() // 0 = January
    const year = date.getFullYear()
    const startYear = month >= 3 ? year : year - 1
    const endYear = (startYear + 1) % 100
    return `${startYear}-${`0${endYear}`.slice(-2)}`
  }

  /** True when the year is one the instance allows plans to be edited for. */
  isPlanYearEditable(planYear?: string): boolean {
    const year = planYear || this.getCurrentPlanYear()
    const option = this.getPlanYearList().find((entry: IUserCbpPlanYearOption) => entry && entry.value === year)
    return !!(option && option.editable)
  }

  // ── Cache ──────────────────────────────────────────────────────────────────

  get expirySeconds(): number {
    const globalConfig: any = this.configSvc.globalConfig
    return (globalConfig && globalConfig.apicache && globalConfig.apicache.cbpTime) || DEFAULT_EXPIRY_SECONDS
  }

  isEntryValid(entry: IUserCbpPlanCacheEntry | undefined): boolean {
    if (!entry || !entry.cachedAt) {
      return false
    }
    return (Date.now() - entry.cachedAt) / 1000 < this.expirySeconds
  }

  /**
   * Returns the cache entry for a plan year, fresh or stale.
   * Callers use isEntryValid() to decide, so a stale entry can still serve as an
   * API-failure fallback rather than being silently discarded.
   */
  async getCacheEntry(planYear: string): Promise<IUserCbpPlanCacheEntry | undefined> {
    if (!planYear) {
      return undefined
    }
    const entry = await this.appDb.withTimeout(
      this.appDb.get<IUserCbpPlanCacheEntry>(STORE_NAME, planYear),
      `user cbp v4 read for ${planYear}`,
    )
    // A V3 entry under this key is not ours to read, and must not reach a caller or be
    // used as the stale-cache fallback on an API failure.
    return this.isV4Entry(entry) ? entry : undefined
  }

  /**
   * Clears one plan year, or every year this service knows about when called with no
   * argument.
   *
   * Deliberately deletes key by key rather than clearing the store: CbpPlanCacheService
   * keeps its V3 entries in the same store, and clearing it would take those with it.
   */
  async clearCache(planYear?: string): Promise<void> {
    try {
      if (planYear) {
        await this.appDb.delete(STORE_NAME, planYear)
        return
      }
      const years = new Set<string>(this.getPlanYearList().map((option: IUserCbpPlanYearOption) => option.value))
      years.add(this.getCurrentPlanYear())
      years.add(this.getCurrentFinancialYear())
      await Promise.all(
        Array.from(years)
          .filter(Boolean)
          .map((year: string) => this.appDb.delete(STORE_NAME, year)),
      )
    } catch (err) {
      console.warn('UserCbpPlansService: clearCache failed', err)
    }
  }

  /**
   * True when the entry read back is a V4 entry and not CbpPlanCacheService's V3 one,
   * which shares this key. V3 sets `cachedAt` too, so the timestamp alone cannot tell
   * them apart — the plan arrays are what distinguish the shape.
   */
  private isV4Entry(entry: any): entry is IUserCbpPlanCacheEntry {
    return !!entry
      && Array.isArray(entry.aparPlanList)
      && Array.isArray(entry.cbpPlanList)
      && Array.isArray(entry.aiCbpPlanList)
  }

  /**
   * Keyed by the year that was ASKED for, not the year the data turned out to be.
   * The cache has to answer the same question that was put to it: an entry filed under
   * the year the API fell back to would miss on every repeat of the original request, and
   * the fallback would be re-fetched every single time.
   */
  private async setCacheEntry(planYear: string, entry: IUserCbpPlanCacheEntry): Promise<void> {
    await this.appDb.withTimeout(
      this.appDb.put(STORE_NAME, planYear, entry),
      `user cbp v4 write for ${planYear}`,
    )
  }

  private async setPlansMap(plansMap: Record<string, IUserCbpPlanMapEntry>): Promise<void> {
    await this.appDb.withTimeout(
      this.appDb.put(PLANS_MAP_STORE, PLANS_MAP_KEY, plansMap),
      'plans map write',
    )
  }

  // ── Plans map ──────────────────────────────────────────────────────────────

  private buildPlansMap(data: IUserCbpPlanData): Record<string, IUserCbpPlanMapEntry> {
    const plansMap: Record<string, IUserCbpPlanMapEntry> = {}
    const now = Date.now()

    const addPlans = (plans: IUserCbpPlan[], planType: TUserCbpPlanMapType) => {
      plans.forEach((plan: IUserCbpPlan) => {
        (plan.contentList || []).forEach((content: IUserCbpPlanContent) => {
          const doId = content && content.identifier
          if (!doId) {
            return
          }
          const candidate: IUserCbpPlanMapEntry = {
            planType,
            caLinkedId: plan.caLinkedId || null,
            endDate: plan.endDate,
            planId: plan.planId,
          }
          const current = plansMap[doId]
          if (!current || this.planOutranks(candidate, current, now)) {
            plansMap[doId] = candidate
          }
        })
      })
    }

    addPlans(data.aparPlanList, 'apar')
    addPlans(data.cbpPlanList, 'cbp')
    addPlans(data.aiCbpPlanList, 'aicbp')
    return plansMap
  }

  // A content in several plans: APAR first, then open over ended, then the soonest open end
  // date (or the latest ended one).
  private planOutranks(candidate: IUserCbpPlanMapEntry, current: IUserCbpPlanMapEntry, now: number): boolean {
    const candidateApar = candidate.planType === 'apar'
    const currentApar = current.planType === 'apar'
    if (candidateApar !== currentApar) {
      return candidateApar
    }

    const candidateEnd = Date.parse(candidate.endDate)
    const currentEnd = Date.parse(current.endDate)
    const candidateOpen = candidateEnd >= now
    const currentOpen = currentEnd >= now
    if (candidateOpen !== currentOpen) {
      return candidateOpen
    }
    return candidateOpen ? candidateEnd < currentEnd : candidateEnd > currentEnd
  }

  // ── Fetch and transform ────────────────────────────────────────────────────

  private async fetchAndCache(
    planYear: string,
    request: IUserCbpPlanRequest | undefined,
    cached: IUserCbpPlanCacheEntry | undefined,
  ): Promise<IUserCbpPlanCacheEntry> {
    try {
      const payload = {
        request: {
          ...(request || {}),
          planYear,
        },
      }

      const res: any = await this.http.post(
        API_END_POINTS.FETCH_USER_CBP_PLAN_DICTIONARY,
        payload,
        { withCredentials: true },
      ).toPromise()

      const resolved = this.resolveYearSlice(res && res.result, planYear)

      const entry: IUserCbpPlanCacheEntry = {
        ...this.transform(resolved.raw, resolved.planYear),
        planYear: resolved.planYear,
        requestedPlanYear: planYear,
        cachedAt: Date.now(),
      }

      // An empty response is deliberately not cached. A proxy rejection (the API
      // whitelist 403, an expired session) can come back as a 200 with no `result`, and
      // caching that would stop the request being made at all until the TTL expires.
      if (entry.aparPlan || entry.cbpPlan || entry.aiCbpPlan) {
        await this.setCacheEntry(planYear, entry)
        await this.setPlansMap(this.buildPlansMap(entry))
      }
      return entry
    } catch (err) {
      // Fall back to a stale cache rather than emptying a working screen.
      if (cached) {
        console.warn('UserCbpPlansService: V4 fetch failed, serving stale cache for', planYear, err)
        return cached
      }
      console.warn('UserCbpPlansService: V4 fetch failed and no cache is available for', planYear, err)
      return { ...this.transform(undefined, planYear), planYear, requestedPlanYear: planYear, cachedAt: 0 }
    }
  }

  /**
   * Picks the year slice the API actually answered with, and reports which year that was.
   *
   * `result` is keyed by plan year, and the requested year is always present — but it can
   * come back empty (zero counts, empty maps) while an earlier year still holds the user's
   * plans. Reading `result[planYear]` alone would then render an empty screen with the
   * data sitting one key away, so an empty slice is treated as "not the answer" and the
   * search moves on. Falling back to `result` itself is no good either: that is the
   * year-keyed wrapper, which has no `aparPlanList` and would also read as "no plans".
   *
   * Order: the requested year, then an unkeyed slice (an instance that answers with the
   * year's contents directly), then the nearest EARLIER year that has plans — 2026-27
   * empty falls back to 2025-26, and on back past any year that is also empty.
   *
   * The candidates are the dictionary's own keys and nothing else: no year is constructed
   * by counting back from the requested one, so a response carrying only 2026-27 and
   * 2025-26 is never probed for a 2024-25 it did not return. The search also only ever
   * goes backwards — a later year holding plans is not what a user looking at an empty
   * current year is missing. Descending sort works because YYYY-YY orders by its start
   * year, and the same comparison places a year before the requested one.
   *
   * When no earlier year has plans either, the requested year is returned with its own
   * (empty) slice, so the screen reports the year that was actually asked for.
   */
  private resolveYearSlice(result: any, planYear: string): { raw: any, planYear: string } {
    if (!result || typeof result !== 'object') {
      return { raw: undefined, planYear }
    }
    if (this.hasPlans(result[planYear])) {
      return { raw: result[planYear], planYear }
    }
    if (this.hasPlans(result)) {
      return { raw: result, planYear }
    }

    const earlier = Object.keys(result)
      .filter((year: string) => year < planYear && this.hasPlans(result[year]))
      .sort()
      .reverse()[0]
    if (earlier) {
      return { raw: result[earlier], planYear: earlier }
    }

    return { raw: this.isYearSlice(result[planYear]) ? result[planYear] : undefined, planYear }
  }

  /** A year's slice of `result`, as opposed to the map that holds those slices. */
  private isYearSlice(value: any): boolean {
    return !!value
      && typeof value === 'object'
      && ('aparPlanList' in value || 'nonAparPlanList' in value)
  }

  /**
   * A year slice that actually carries plans. The counts are not trusted on their own —
   * they are reported alongside the maps and it is the maps that get rendered, so a slice
   * only counts as populated when one of them has an entry.
   */
  private hasPlans(value: any): boolean {
    if (!this.isYearSlice(value)) {
      return false
    }
    return this.planCount(value.aparPlanList) > 0 || this.planCount(value.nonAparPlanList) > 0
  }

  private planCount(plans: any): number {
    return plans && typeof plans === 'object' ? Object.keys(plans).length : 0
  }

  /**
   * Flattens the API's planId-keyed maps into the three arrays the UI renders, stamping
   * each plan with the year it was fetched for.
   *
   * APAR plans come through as one list. Non-APAR plans are split on `planType`: 'AICBP'
   * marks a plan the AI drafted, which the Draft CBP Plan strip shows separately from
   * ordinary CBP plans — the same rule widget-user-lib.service.ts applies when it carries
   * `planType` through as `planTypeV2`.
   */
  private transform(raw: any, planYear: string): IUserCbpPlanData {
    const aparPlanList = this.toPlanArray(raw && raw.aparPlanList, planYear, true)
    const nonApar = this.toPlanArray(raw && raw.nonAparPlanList, planYear, false)

    const aiCbpPlanList = nonApar.filter((plan: IUserCbpPlan) => plan.planType === AI_PLAN_TYPE)
    const cbpPlanList = nonApar.filter((plan: IUserCbpPlan) => plan.planType !== AI_PLAN_TYPE)

    return {
      aparPlanList,
      cbpPlanList,
      aiCbpPlanList,
      aparPlan: aparPlanList.length,
      cbpPlan: cbpPlanList.length,
      aiCbpPlan: aiCbpPlanList.length,
    }
  }

  /** One planId-keyed map to an array, each plan stamped with its plan year and APAR flag. */
  private toPlanArray(plans: Record<string, any> | undefined, planYear: string, isApar: boolean): IUserCbpPlan[] {
    if (!plans) {
      return []
    }
    return Object.keys(plans)
      .map((planId: string) => plans[planId])
      .filter(Boolean)
      .map((plan: any) => ({ ...plan, planYear, isApar }))
  }
}
