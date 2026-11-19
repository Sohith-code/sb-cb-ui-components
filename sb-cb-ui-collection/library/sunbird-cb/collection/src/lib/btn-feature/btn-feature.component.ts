import { Component, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core'
import { Event, NavigationEnd, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { MobileAppsService } from '../_services/mobile-apps.service'
import { CustomTourService } from '../_common/tour-guide/tour-guide.service'
import { BtnFeatureService } from './btn-feature.service'
import { NsWidgetResolver, WidgetBaseComponent } from '@sunbird-cb/resolver-v2'
import { ConfigurationsService, EventService, NsPage } from '@sunbird-cb/utils-v2'

export const typeMap = {
  cardFull: 'card-full',
  cardMini: 'card-mini',
  cardSmall: 'card-small',
  matButton: 'mat-button',
  matFabButton: 'mat-fab',
  matFlatButton: 'mat-flat-button',
  matIconButton: 'mat-icon-button',
  matMiniFabButton: 'mat-mini-fab',
  matRaisedButton: 'mat-raised-button',
  matStrokedButton: 'mat-stroked-button',
  menuItem: 'mat-menu-item',
  featureItem: 'feature-item',
  externalLinkButton: 'external-link-button',
}

@Component({
  selector: 'ws-widget-btn-feature',
  templateUrl: './btn-feature.component.html',
  styleUrls: ['./btn-feature.component.scss'],
  standalone: false
})
export class BtnFeatureComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, NsWidgetResolver.IWidgetData<NsPage.INavLink> {
  @Input() widgetData!: any
  @Input() showFixedLength = false
  @Input()
  @HostBinding('id')
  public id!: string
  readonly displayType = typeMap
  badgeCount = ''
  defaultIconSize = 24
  isPinned = false
  instanceVal = ''
  isPinFeatureAvailable = true
  showDashboardOptions = false
  private pinnedAppsChangeSubs?: Subscription
  private navigationSubs?: Subscription

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event?.target as HTMLElement
    if (!target?.closest('.dashboard-wrapper')) {
      this.showDashboardOptions = false
    }
  }

  constructor(
    private events: EventService,
    private configurationsSvc: ConfigurationsService,
    private btnFeatureSvc: BtnFeatureService,
    private router: Router,
    private mobileSvc: MobileAppsService,
    private configSvc: ConfigurationsService,
    private tour: CustomTourService,
  ) {
    super()
  }

  updateBadge() {
    if (this.widgetData.actionBtn && this.widgetData.actionBtn.badgeEndpoint) {
      this.btnFeatureSvc
        .getBadgeCount(this.widgetData.actionBtn.badgeEndpoint)
        .then((count: any) => {
          if (count > 99) {
            this.badgeCount = '99+'
          } else if (count > 0) {
            this.badgeCount = count.toString()
          } else {
            this.badgeCount = ''
          }
        })
        .catch(_err => { })
    }
  }

  ngOnInit() {
    this.instanceVal = this.configSvc.rootOrg || ''
    if (this.configSvc.restrictedFeatures) {
      this.isPinFeatureAvailable = !this.configSvc.restrictedFeatures.has('pinFeatures')
    }
    if (
      !this.widgetData.actionBtn &&
      this.widgetData.actionBtnId &&
      this.configurationsSvc.appsConfig
    ) {
      this.widgetData.actionBtn = this.configurationsSvc.appsConfig.features[this.widgetData.actionBtnId]
      if (this.widgetData.actionBtn && this.widgetData.actionBtn.badgeEndpoint) {
        this.navigationSubs = this.router.events.subscribe((e: Event) => {
          if (e instanceof NavigationEnd) {
            this.updateBadge()
          }
        })
      }
    }

    this.pinnedAppsChangeSubs = this.configurationsSvc.pinnedApps.subscribe(pinnedApps => {
      this.isPinned = Boolean(
        this.widgetData.actionBtn && pinnedApps.has(this.widgetData.actionBtn.id),
      )
    })
    if (!this.id && this.widgetData.actionBtnId) {
      this.id = this.widgetData.actionBtnId
    }
  }

  ngOnDestroy() {
    if (this.pinnedAppsChangeSubs) {
      this.pinnedAppsChangeSubs.unsubscribe()
    }
    if (this.navigationSubs) {
      this.navigationSubs.unsubscribe()
    }
  }

  get featureStatusColor() {
    if (this.widgetData.actionBtn) {
      switch (this.widgetData.actionBtn.status) {
        case 'earlyAccess':
          return 'primary'
        case 'beta':
          return 'accent'
        case 'alpha':
          return 'warn'
        default:
          return null
      }
    }
    return null
  }

  get desktopVisible() {
    if (this.widgetData.actionBtn && this.widgetData.actionBtn.mobileAppFunction) {
      if (!this.mobileSvc.isMobile) {
        return false
      }
      return true
    }
    return true
  }

  togglePin(featureId: string, event: any) {
    event.preventDefault()
    event.stopPropagation()
    this.events.raiseInteractTelemetry({
      type: 'pin',
      subType: 'feature',
      id: `${featureId}`,
    }, {})
    this.configurationsSvc.pinnedApps.pipe(take(1)).subscribe(pinnedApps => {
      const newPinnedApps = new Set(pinnedApps)
      if (newPinnedApps.has(featureId)) {
        newPinnedApps.delete(featureId)
      } else {
        newPinnedApps.add(featureId)
      }
      this.isPinned = newPinnedApps.has(featureId)
      this.configurationsSvc.prefChangeNotifier.next({
        pinnedApps: Array.from(newPinnedApps).join(','),
      })
      this.configurationsSvc.pinnedApps.next(newPinnedApps)
    })
  }

  startTour() {
    this.tour.startTour()
  }

  toggleDashboardDropdown(event: MouseEvent) {
    event?.stopPropagation()
    this.showDashboardOptions = !this.showDashboardOptions
  }

  onDashboardSelect(value: string) {
    this.showDashboardOptions = false
    if (value === 'igot') {
      window.open('/app/my-dashboard/dashboard-view', '_blank')
    } else if (value === 'mdo') {
      window.open('/app/my-dashboard', '_blank')
    } else if (value === 'aiCbp') {
      window.open('/app/my-dashboard/ai-cbp-dashboard', '_blank')
    }
  }
}
