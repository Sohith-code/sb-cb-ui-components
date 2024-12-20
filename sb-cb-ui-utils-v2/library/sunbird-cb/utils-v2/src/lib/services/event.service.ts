import { Inject, Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { WsEvents } from './event.model'
import { UtilityService } from './utility.service'
/* tslint:disable*/
import _ from 'lodash'
import moment from 'moment'
@Injectable({
  providedIn: 'root',
})
export class EventService {
  todaysEvents: any = []
  todaysLiveEvents: any = []
  keySpeakerEvents: any = []

  private eventsSubject = new Subject<WsEvents.IWsEvents<any>>()
  public events$ = this.eventsSubject.asObservable()

  private eventsChatbotSubject = new Subject<WsEvents.IWsEvents<any>>()
  public chatbotEvents$ = this.eventsChatbotSubject.asObservable()

  private eventsGetStartSubject = new Subject<WsEvents.IWsEvents<any>>()
  public getStartEvents$ = this.eventsGetStartSubject.asObservable()

  private eventsPRSubject = new Subject<WsEvents.IWsEvents<any>>()
  public getPREvents$ = this.eventsPRSubject.asObservable()

  environment: any
  constructor(
    @Inject('environment') environment: any,
    private utilitySvc: UtilityService,
  ) {
    this.environment = environment
    // this.focusChangeEventListener()
  }

  dispatchEvent<T>(event: WsEvents.IWsEvents<T>) {
    event.pageContext = this.getContext(event.pageContext)
    this.eventsSubject.next(event)
  }

  dispatchChatbotEvent<T>(event: WsEvents.IWsEvents<T>) {
    this.eventsChatbotSubject.next(event)
  }

  dispatchGetStartedEvent<T>(event: WsEvents.IWsEvents<T>) {
    this.eventsGetStartSubject.next(event)
  }

  dispatchPlatformRatingEvent<T>(event: WsEvents.IWsEvents<T>) {
    this.eventsPRSubject.next(event)
  }


  // helper functions
  raiseInteractTelemetry(edata: WsEvents.ITelemetryEdata, object: any, pageContext?: WsEvents.ITelemetryPageContext) {
    this.dispatchEvent<WsEvents.IWsEventTelemetryInteract>({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      data: {
        edata,
        object,
        pageContext: this.getContext(pageContext),
        eventSubType: WsEvents.EnumTelemetrySubType.Interact,
      },
      from: '',
      to: 'Telemetry',
    })
  }

  raiseFeedbackTelemetry(edata: WsEvents.ITelemetryEdata, object: any, from?: string) {
    this.dispatchEvent<WsEvents.IWsEventTelemetryInteract>({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      data: {
        edata,
        object,
        eventSubType: WsEvents.EnumTelemetrySubType.Feedback,
      },
      from: from || '',
      to: 'Telemetry',
    })
  }

  // Raise custom impression events eg:on tab change
  raiseCustomImpression(object: any, pageContext?: WsEvents.ITelemetryPageContext) {
    this.dispatchEvent<WsEvents.IWsEventTelemetryImpression>({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      data: {
        object,
        pageContext: this.getContext(pageContext),
        eventSubType: WsEvents.EnumTelemetrySubType.Impression,
      },
      from: '',
      to: 'Telemetry',
    })
  }

  // private focusChangeEventListener() {
  //   fromEvent(window, 'focus').subscribe(() => {
  //     this.raiseInteractTelemetry('focus', 'gained', {})
  //   })
  //   fromEvent(window, 'blur').subscribe(() => {
  //     this.raiseInteractTelemetry('focus', 'lost', {})
  //   })
  // }

  // Method to get the context information about the telemetry interact event
  private getContext(pageContext: WsEvents.ITelemetryPageContext | undefined): WsEvents.ITelemetryPageContext {
    const routeDataContext = this.utilitySvc.routeData
    // initialize with the route data configuration - current route's pageID & module
    const finalContext: WsEvents.ITelemetryPageContext = {
      pageId: routeDataContext.pageId,
      module: routeDataContext.module,
    }
    if (pageContext) {
      // if context has pageIdExt, append it to the route's pageId
      if (pageContext.pageIdExt) {
        finalContext.pageId = `${routeDataContext.pageId}_${pageContext.pageIdExt}`
      } else if (pageContext.pageId) {
        // else context has pageId, override it to the final pageID
        finalContext.pageId = pageContext.pageId
      }
      // if context has module, override it to the final module
      if (pageContext.module) {
        finalContext.module = pageContext.module
      }
    }

    return finalContext
  }

  public handleTabTelemetry(subType: string, data: WsEvents.ITelemetryTabData, object?: any) {
    // raise a tab click interact event
    this.raiseInteractTelemetry(
      {
        subType,
        type: WsEvents.EnumInteractTypes.CLICK,
        id: `${_.camelCase(data.label)}-tab`,
      },
      {
        // context: {
        //   position: data.index,
        // },
        ...object
      },
      {
        pageIdExt: `${_.camelCase(data.label)}-tab`,
      })

    // raise a tab click impression event
    this.raiseCustomImpression({
      context: {
        position: data.index,
      },
      ...object
    }, {
      pageIdExt: `${_.camelCase(data.label)}-tab`,
    })
  }

  getPublicUrl(url: string): string {
    const mainUrl = url.split('/content').pop() || ''
    return `${this.environment.contentHost}/${this.environment.contentBucket}/content${mainUrl}`
  }

  allEventDateFormat(datetime: any) {
    const date = new Date(datetime).getDate()
    const year = new Date(datetime).getFullYear()
    const month = new Date(datetime).getMonth()
    const hours = new Date(datetime).getHours()
    const minutes = new Date(datetime).getMinutes()
    const seconds = new Date(datetime).getSeconds()
    const formatedDate = new Date(year, month, date, hours, minutes, seconds, 0)
    // let format = 'YYYY-MM-DD hh:mm a'
    // if (!timeAllow) {
    const format = 'YYYY-MM-DD'
    // }
    const readableDateMonth = moment(formatedDate).format(format)
    const finalDateTimeValue = `${readableDateMonth}`
    return finalDateTimeValue
  }

  compareDate(startDate: any) {
    const now = new Date()

    // tslint:disable-next-line:prefer-template
    const day = ('0' + (new Date().getDate())).slice(-2)
    const year = new Date().getFullYear()
    // tslint:disable-next-line:prefer-template
    const month = ('0' + (now.getMonth() + 1)).slice(-2)
    const todaysdate = `${year}-${month}-${day}`
    if (startDate === todaysdate) {
      return true
    }
    return false
  }

  customDateFormat(date: any, time: any) {
    const stime = time.split('+')[0]
    const hour = stime.substr(0, 2)
    const min = stime.substr(2, 3)
    return `${date} ${hour}${min}`
  }
  sortItemByTime(eventsdata: any) {
    return eventsdata.sort((a: any, b: any) => {
      const firstDate: any = new Date(a.eventDate)
      const secondDate: any = new Date(b.eventDate)
      return secondDate > firstDate ? 1 : -1
    })
  }
  sortItemByTimeAsc(eventsdata: any) {
    return eventsdata.sort((a: any, b: any) => {
      const firstDate: any = new Date(a.eventDate)
      const secondDate: any = new Date(b.eventDate)
      return secondDate < firstDate ? 1 : -1
    })
  }


  setEventListData(eventObj: any) {
    if (eventObj !== undefined) {
      this.todaysEvents = []
      this.todaysLiveEvents = []
      this.keySpeakerEvents = []
      const data = eventObj
      let isEventLive: boolean = false
      let isEventRecording: boolean = false
      let isEventPast: boolean = false
      let isEventFuture: boolean = false
      // console.log('strip comp', data)
      Object.keys(data).forEach((index: any) => {

        isEventRecording = false
        isEventLive = false
        isEventPast = false
        isEventFuture = false
        const obj = data[index]
        const floor = Math.floor
        const hours = floor(obj.duration / 60)
        const minutes = obj.duration % 60
        const duration = (hours === 0) ? ((minutes === 0) ? '---' : `${minutes} minutes`) : (minutes === 0) ? (hours === 1) ?
          `${hours} hour` : `${hours} hours` : (hours === 1) ? `${hours} hour ${minutes} minutes` :
          `${hours} hours ${minutes} minutes`
        const creatordata = obj.creatorDetails !== undefined ? obj.creatorDetails : []
        const str = creatordata && creatordata.length > 0 ? creatordata.replace(/\\/g, '') : []
        const creatorDetails = str && str.length > 0 ? JSON.parse(str) : creatordata

        const stime = obj.startTime.split('+')[0]
        const hour = stime.substr(0, 2)
        const min = stime.substr(2, 3)
        const starttime = `${hour}${min}`

        const etime = obj.endTime.split('+')[0]
        const ehour = etime.substr(0, 2)
        const emin = etime.substr(2, 3)
        const endtime = `${ehour}${emin}`
        const eventDate = this.customDateFormat(obj.startDate, obj.startTime)
        const eventendDate = this.customDateFormat(obj.endDate, obj.endTime)
        const now = new Date()
        const today = moment(now).format('YYYY-MM-DD HH:mm')
        if (moment(today).isBetween(eventDate, eventendDate)) {
          isEventRecording = false
          isEventLive = true
          if (today >= eventendDate) {
            if (obj.recordedLinks && obj.recordedLinks.length > 0) {
              isEventRecording = true
              isEventLive = false
            }
          }
        } else if (today >= eventendDate) {
          isEventRecording = true
          isEventLive = false
          if (moment(today).isAfter(eventendDate) && moment(today).isAfter(eventDate)) {
            isEventPast = true
          }
        } else {
          if (moment(today).isBefore(eventDate) && moment(today).isBefore(eventendDate)) {
            isEventFuture = true
          }
        }
        const eventDataObj = {
          eventDate,
          eventendDate,
          isEventLive,
          isEventFuture,
          isEventPast,
          isEventRecording,
          event: obj,
          eventName: obj.name,
          eventStartTime: starttime,
          eventEndTime: endtime,
          eventStartDate: obj.startDate,
          eventCreatedOn: this.allEventDateFormat(obj.createdOn),
          eventDuration: duration,
          eventjoined: creatorDetails.length,
          eventThumbnail: obj.appIcon && (obj.appIcon !== null || obj.appIcon !== undefined) ?
            this.getPublicUrl(obj.appIcon) :
            '/assets/icons/Events_default.png',
          pastevent: false,
        }
        const isToday = this.compareDate(obj.startDate)
        if (isToday) {
          this.todaysEvents.push(eventDataObj)
        }
        if (isToday && isEventLive) {
          this.todaysLiveEvents.push(eventDataObj)
        }
        this.keySpeakerEvents.push(eventDataObj)
      })

      this.todaysLiveEvents = this.sortItemByTime(this.todaysLiveEvents)
      this.keySpeakerEvents = this.getKeySpeakerEvents(this.keySpeakerEvents)
      this.todaysEvents = this.getTodaysEvents(this.todaysEvents)

    }
  }
  getTodaysEvents(eventData: any) {
    let liveEvents: any = []
    let pastEvents: any = []
    let futureEvents: any = []

    liveEvents = this.todaysLiveEvents
    pastEvents = eventData.filter((pastEvent: any) => pastEvent.isEventPast)
    futureEvents = eventData.filter((futureEvent: any) => futureEvent.isEventFuture)
    liveEvents = this.sortItemByTimeAsc(liveEvents)
    futureEvents = this.sortItemByTimeAsc(futureEvents)
    pastEvents = this.sortItemByTime(pastEvents)
    this.todaysEvents = [...liveEvents, ...futureEvents, ...pastEvents]

    return this.todaysEvents
  }

  getKeySpeakerEvents(eventData: any) {
    let liveEvents: any = []
    let pastEvents: any = []
    let futureEvents: any = []

    liveEvents = this.todaysLiveEvents
    pastEvents = eventData.filter((pastEvent: any) => pastEvent.isEventPast)
    futureEvents = eventData.filter((futureEvent: any) => futureEvent.isEventFuture)
    liveEvents = this.sortItemByTimeAsc(liveEvents)
    futureEvents = this.sortItemByTimeAsc(futureEvents)
    pastEvents = this.sortItemByTime(pastEvents)
    this.keySpeakerEvents = [...liveEvents, ...futureEvents, ...pastEvents]

    return this.keySpeakerEvents
  }

}
