import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ContentDictionaryService } from '@sunbird-cb/consumption'
import {
  IComprehensiveAssessmentAttempts,
  IComprehensiveAssessmentCourse,
  IComprehensiveAssessmentResult,
  IComprehensiveAssessmentStatus,
} from '../_models/common.model'

const API_END_POINTS = {
  CAN_ATTEMPT: (assessmentId: string) => `/apis/proxies/v8/user/assessment/retake/${assessmentId}`,
  CAN_ATTEMPT_V5: (assessmentId: string) => `/apis/proxies/v8/user/assessment/v5/retake/${assessmentId}`,
  ASSESSMENT_RESULT_V4: '/apis/proxies/v8/user/assessment/v4/result',
  ASSESSMENT_RESULT_V5: '/apis/proxies/v8/user/assessment/v5/result',
  ENROLMENT_DETAILS: '/apis/proxies/v8/learner/course/v5/user/enrollment/details',
}

const V5_COMPATIBILITY_LEVEL = 7
const DEFAULT_COMPATIBILITY_LEVEL = 6
const QUESTION_SET_MIME_TYPES = ['application/vnd.sunbird.questionset', 'application/quiz']
const COMPLETED_STATUS = 2

@Injectable({
  providedIn: 'root',
})
export class ComprehensiveAssessmentService {
  constructor(
    private contentDictionarySvc: ContentDictionaryService,
    private http: HttpClient,
  ) { }

  /**
   * Only the training plan's mandatory courses hold the assessment back; the optional ones are
   * carried in `courses` but never block the unlock, and never reach the pending list. Metadata
   * and enrolment are both fetched for the mandatory ones alone, so an optional course costs
   * neither a content read nor a row in the enrolment request.
   */
  async getUnlockStatus(contentReadData: any): Promise<IComprehensiveAssessmentStatus> {
    const contentList: any[] = contentReadData?.trainingPlan_v2?.contentList || []
    const mandatoryIdentifiers: string[] = contentList
      .filter((item: any) => !!item?.identifier && item?.mandatory === true)
      .map((item: any) => item.identifier)

    if (!mandatoryIdentifiers.length) {
      // Nothing mandatory to complete, so nothing holds the assessment back.
      return { courses: [], pendingCourses: [], isAllCoursesCompleted: true }
    }

    const [dictionary, enrolments] = await Promise.all([
      this.readDictionary(mandatoryIdentifiers),
      this.readEnrolments(mandatoryIdentifiers),
    ])

    const courses: IComprehensiveAssessmentCourse[] = contentList
      .filter((item: any) => !!item?.identifier)
      .map((item: any) => {
        const meta = dictionary[item.identifier] || {}
        const enrolment = enrolments[item.identifier]
        return {
          identifier: item.identifier,
          name: meta.name || '',
          code: meta.code || '',
          mandatory: !!item.mandatory,
          completed: enrolment?.status === COMPLETED_STATUS,
        }
      })

    const pendingCourses = courses.filter(
      (course: IComprehensiveAssessmentCourse) => course.mandatory && !course.completed,
    )
    return { courses, pendingCourses, isAllCoursesCompleted: !pendingCourses.length }
  }

  async getAttemptStatus(contentReadData: any): Promise<IComprehensiveAssessmentAttempts> {
    const assessment = this.resolveAssessmentNode(contentReadData)
    const fallbackAllowed = this.resolveAttemptsAllowed(contentReadData, 0)
    if (!assessment?.identifier) {
      return this.toAttempts(0, fallbackAllowed)
    }

    const compatibilityLevel = Number(assessment.compatibilityLevel) || DEFAULT_COMPATIBILITY_LEVEL
    const url = compatibilityLevel >= V5_COMPATIBILITY_LEVEL
      ? API_END_POINTS.CAN_ATTEMPT_V5(assessment?.childNodes[0])
      : API_END_POINTS.CAN_ATTEMPT(assessment?.childNodes[0])

    try {
      const response: any = await this.http.get<any>(url).toPromise()
      const result = response?.result || {}
      const attemptsMade = Number(result.attemptsMade) || 0
      return this.toAttempts(attemptsMade, this.resolveAttemptsAllowed(contentReadData, result.attemptsAllowed))
    } catch (_err) {
      return this.toAttempts(0, fallbackAllowed)
    }
  }

  async getResult(content: any, courseId: string, batchId: string): Promise<IComprehensiveAssessmentResult | null> {
    const questionSet = this.findQuestionSet(content)
    const assessmentId = questionSet?.identifier || content?.childNodes?.[0]
    if (!assessmentId) {
      return null
    }

    const compatibilityLevel = Number(questionSet?.compatibilityLevel) || DEFAULT_COMPATIBILITY_LEVEL
    const url = compatibilityLevel >= V5_COMPATIBILITY_LEVEL
      ? API_END_POINTS.ASSESSMENT_RESULT_V5
      : API_END_POINTS.ASSESSMENT_RESULT_V4
    const request = {
      request: {
        assessmentId,
        batchId,
        courseId,
      },
    }

    try {
      const response: any = await this.http.post<any>(url, request).toPromise()
      const result = response?.result
      if (!result || result.isInProgress) {
        return null
      }
      return {
        score: Number(result.overallResult) || 0,
        passPercentage: Number(result.passPercentage) || 0,
      }
    } catch (_err) {
      return null
    }
  }

  private findQuestionSet(node: any): any {
    for (const child of node?.children || []) {
      if (QUESTION_SET_MIME_TYPES.includes(child?.mimeType)) {
        return child
      }
      const nested = this.findQuestionSet(child)
      if (nested) {
        return nested
      }
    }
    return null
  }

  private resolveAssessmentNode(contentReadData: any): any {
    const children: any[] = contentReadData?.children || []
    const questionSet = children.find((child: any) => QUESTION_SET_MIME_TYPES.includes(child?.mimeType))
    return questionSet || children[0] || contentReadData
  }

  private resolveAttemptsAllowed(contentReadData: any, attemptsAllowed: any): number {
    const fromApi = Number(attemptsAllowed)
    if (fromApi > 0) {
      return fromApi
    }
    const authored = Number(contentReadData?.maxAssessmentRetakeAttempts)
    return authored > 0 ? authored : 0
  }

  private toAttempts(attemptsMade: number, attemptsAllowed: number): IComprehensiveAssessmentAttempts {
    return {
      attemptsMade,
      attemptsAllowed,
      attemptsRemaining: Math.max(attemptsAllowed - attemptsMade, 0),
      isAttempted: attemptsMade > 0,
    }
  }

  /** Course metadata, dictionary cache first and content read only for what it misses. */
  private async readDictionary(identifiers: string[]): Promise<Record<string, any>> {
    try {
      const contents = await this.contentDictionarySvc.getContents(identifiers).toPromise()
      return contents || {}
    } catch (_err) {
      return {}
    }
  }

  /**
   * The learner's enrolment for the given courses, keyed by course id. The response identifies a
   * course by `courseId`, with `contentId` and `collectionId` carrying the same value, so all
   * three are indexed and a caller can look an enrolment up by whichever id it holds.
   *
   * An empty map on failure leaves every course counted as not completed, which keeps the
   * assessment locked rather than opening it on a bad response.
   */
  private async readEnrolments(identifiers: string[]): Promise<Record<string, any>> {
    const request = {
      request: {
        retiredCoursesEnabled: true,
        courseId: identifiers,
      },
    }

    try {
      const response: any = await this.http.post<any>(API_END_POINTS.ENROLMENT_DETAILS, request).toPromise()
      const courses: any[] = response?.result?.courses || []
      return courses.reduce((enrolments: Record<string, any>, course: any) => {
        [course?.courseId, course?.contentId, course?.collectionId]
          .filter((id: string) => !!id)
          .forEach((id: string) => {
            enrolments[id] = course
          })
        return enrolments
      },                    {} as Record<string, any>)
    } catch (_err) {
      return {}
    }
  }
}
