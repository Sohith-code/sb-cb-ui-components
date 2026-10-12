import { Component, HostListener, Input, OnInit } from '@angular/core'
import { MatTabChangeEvent } from '@angular/material/tabs'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService, EventService, UtilityService, WsEvents } from '@sunbird-cb/utils-v2'
/* tslint:disable */
import * as _ from 'lodash'
import { TranslateService } from '@ngx-translate/core'
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { getTabSectionDataKey } from '../../tab-section.util'

@Component({
    selector: 'sb-uic-mdo-channel-v2',
    templateUrl: './mdo-channel-v2.component.html',
    styleUrls: ['./mdo-channel-v2.component.scss'],
    standalone: false
})
export class MdoChannelV2Component implements OnInit {
    @Input() sectionList: any = []
    // @Input() configDetails: any
    @Input() slwConfiguration: any
    providerId: string = '123456789'
    channnelName = ''
    orgId = ''
    selectedIndex = 0
    hideCompetencyBlock: boolean = false
    contentTabEmptyResponseCount: number = 0
    getTabDataKey = getTabSectionDataKey
    titles = [
        { title: 'Learn', url: '/page/learn', icon: 'school', disableTranslate: false },
        {
            title: `MDO Channels`,
            url: `/app/learn/mdo-channels/all-channels`,
            icon: '', disableTranslate: true,
        },
    ]
    showModal: boolean = false
    descriptionMaxLength = 500
    isTelemetryRaised: boolean = false
    stripWidth: any
    iframeHeight: any = '240px'
    lookerProUrl: SafeResourceUrl = ''
    isMobile = false
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private eventSvc: EventService,
        private translate: TranslateService,
        private langtranslations: MultilingualTranslationsService,
        public configSvc: ConfigurationsService,
        private sanitizer: DomSanitizer,
        private utillsSvc: UtilityService,
    ) {
        this.isMobile = this.utillsSvc.isMobile
        if (this.route.snapshot.data && this.route.snapshot.data.formData
            && this.route.snapshot.data.formData.data
            && this.route.snapshot.data.formData.data.result
            && this.route.snapshot.data.formData.data.result.form
            && this.route.snapshot.data.formData.data.result.form.data
            && this.route.snapshot.data.formData.data.result.form.data.sectionList
        ) {
            this.sectionList = [
                {
                    "active": true,
                    "enabled": true,
                    "title": "",
                    "key": "sectionTopBanner",
                    "order": 1,
                    "column": [
                        {
                            "active": true,
                            "enabled": true,
                            "key": "topSection",
                            "title": "",
                            "colspan": 12,
                            "background": "",
                            "bannerBackgroudClass": "web-banner-background",
                            "data": {
                                "background": "#1B4CA1",
                                "logo": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745380667949_Maharashtra Logo Strip.png",
                                "logoMobile": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745380774459_Logo 4.jpeg",
                                "bannerBackgroundWebMobile": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1735299398814_ctd_logo.png",
                                "title": "महाराष्ट्र टेक लर्निंग वीक",
                                "titleClass": "main-title",
                                "titleColor": "#fca311",
                                "subTitle": "",
                                "subTitleClass": "sub-title",
                                "subTitleColor": "#FFFFFF",
                                "subTitleColorMobile": "#000",
                                "subTitleTwo": "महाराष्ट्र",
                                "subTitleColorTwo": "#FFFFFF",
                                "subTitleColorTwoMobile": "#000",
                                "description": "महाराष्ट्र नेहमीच प्रगतीच्या अग्रस्थानी राहिला आहे. शिक्षण, आरोग्य, उद्योग, कृषी आणि प्रशासन या क्षेत्रांमध्ये नवोन्मेषाला प्रोत्साहन देत आला आहे. डिजिटल युगातील परिवर्तनाच्या गतीनुसार त्याच्या बरोबरीने शासकीय कामकाज देखील विकसित होणं आवश्यक आहे.  टेक-वारी - महाराष्ट्राचा टेक लर्निंग वीक, हे त्या दृष्टीने एक पाउल आहे.  ज्यात तंत्रज्ञान, परंपरा आणि परिवर्तन यांच्या त्रिवेणी  संगमाच्या माध्यमातून शासकीय कर्मचारी लोकाभिमुख प्रशासनासाठी सज्ज होईल.",
                                "descriptionColor": "#FFFFFF",
                                "sliderData": {
                                    "styleData": {
                                        "bannerMetaClass": "",
                                        "bannerMeta": "visible",
                                        "bannerMetaAlign": "right",
                                        "navigationArrows": "visible",
                                        "borderRadius": "12px",
                                        "customHeight": "334px",
                                        "arrowsPlacement": "",
                                        "imageBorderWidth": 3,
                                        "imageBorderColor": "#FFFFFF",
                                        "imageBorderStyle": "solid",
                                        "responsive": {
                                            "bannerMetaClass": "inline-meta",
                                            "customHeight": "232px",
                                            "bannerMetaAlign": "center",
                                            "navigationArrows": "visible",
                                            "dots": "hidden",
                                            "arrowsPlacement": "middle-inline"
                                        }
                                    },
                                    "sliders": [
                                        {
                                            "active": true,
                                            "banners": {
                                                "l": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745381273661_Maharashtra SLW 1.jpeg",
                                                "m": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745381273661_Maharashtra SLW 1.jpeg",
                                                "s": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745381273661_Maharashtra SLW 1.jpeg",
                                                "xl": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745381273661_Maharashtra SLW 1.jpeg",
                                                "xs": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745381273661_Maharashtra SLW 1.jpeg",
                                                "xxl": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745381273661_Maharashtra SLW 1.jpeg"
                                            },
                                            "redirectUrl": "",
                                            "queryParams": {},
                                            "title": ""
                                        },
                                        {
                                            "active": true,
                                            "banners": {
                                                "l": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745381330450_Maharashtra SLW 4.jpeg",
                                                "m": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745381330450_Maharashtra SLW 4.jpeg",
                                                "s": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745381330450_Maharashtra SLW 4.jpeg",
                                                "xl": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745381330450_Maharashtra SLW 4.jpeg",
                                                "xs": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745381330450_Maharashtra SLW 4.jpeg",
                                                "xxl": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745381330450_Maharashtra SLW 4.jpeg"
                                            },
                                            "redirectUrl": "",
                                            "queryParams": {},
                                            "title": ""
                                        }
                                    ]
                                },
                                "metrics": {
                                    "background": "#1B4CA1",
                                    "data": [
                                        {
                                            "icon": "https://portal.karmayogi.nic.in/content-store/content/do_114061821837287424110/artifact/do_114061821837287424110_1716531049564_network.svg",
                                            "iconColor": "#FFFFFF",
                                            "value": "9876",
                                            "valueColor": "#FFFFFF",
                                            "label": "Total Users",
                                            "labelColor": "#FFFFFF",
                                            "linebreak": false,
                                            "background": "#1B4CA1"
                                        },
                                        {
                                            "icon": "https://portal.karmayogiqa.nic.in/content-store/orgStore/0135071359030722569/1715676445834_badges.svg",
                                            "iconColor": "#FFFFFF",
                                            "value": "2678",
                                            "valueColor": "#FFFFFF",
                                            "label": "Certificates",
                                            "labelColor": "#FFFFFF",
                                            "linebreak": false,
                                            "background": "#1B4CA1"
                                        },
                                        {
                                            "icon": "https://portal.karmayogi.nic.in/content-store/content/do_114061824512778240111/artifact/do_114061824512778240111_1716531357219_knowledge-resources.svg",
                                            "iconColor": "#FFFFFF",
                                            "value": "9867",
                                            "valueColor": "#FFFFFF",
                                            "label": "Enrolments",
                                            "labelColor": "#FFFFFF",
                                            "linebreak": false,
                                            "background": "#1B4CA1"
                                        },
                                        {
                                            "icon": "https://portal.karmayogi.nic.in/content-store/content/do_114061847565107200114/artifact/do_114061847565107200114_1716534165064_program1.svg",
                                            "iconColor": "#FFFFFF",
                                            "value": "12",
                                            "valueColor": "#FFFFFF",
                                            "label": "Content Published",
                                            "labelColor": "#FFFFFF",
                                            "linebreak": false,
                                            "background": "#1B4CA1"
                                        },
                                        {
                                            "icon": "https://portal.karmayogi.nic.in/content-store/content/do_114061826604261376113/artifact/do_114061826604261376113_1716531614554_percent.svg",
                                            "iconColor": "#FFFFFF",
                                            "value": "40",
                                            "valueColor": "#FFFFFF",
                                            "label": "24hr Login",
                                            "labelColor": "#FFFFFF",
                                            "linebreak": false,
                                            "background": "#1B4CA1"
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                },
                {
                    "active": true,
                    "enabled": true,
                    "title": "",
                    "key": "sectionLookerpro",
                    "order": 4,
                    "column": [
                        {
                            "active": true,
                            "enabled": true,
                            "key": "lookerSection",
                            "title": "",
                            "colspan": 12,
                            "background": "banner",
                            "data": {
                                "header": {
                                    "headerText": "Performance Dashboard",
                                    "description": "View MDO performance based on their learning activities for the week, with real-time insights into progress, engagement, and development across various MDOs."
                                },
                                "disableDynamicHeight": false,
                                "mobileHeight": "500px",
                                "desktopHeight": "280px",
                                "lookerProDesktopUrl": "https://lookerstudio.google.com/embed/reporting/17028145-cdd5-459d-bb13-b3de2ef62aee/page/fyd9D",
                                "lookerProMobileUrl": "https://lookerstudio.google.com/embed/reporting/17028145-cdd5-459d-bb13-b3de2ef62aee/page/fyd9D"
                            }
                        }
                    ]
                },
                {
                    "active": false,
                    "enabled": false,
                    "title": "",
                    "key": "sectionTopLearners",
                    "order": 2,
                    "column": [
                        {
                            "active": true,
                            "enabled": true,
                            "key": "topLearners",
                            "title": "Top 10 Learners",
                            "colspan": 12,
                            "background": "",
                            "data": {
                                "title": "Top 10 Learners",
                                "enableMonth": false,
                                "titleFontColor": "#000000",
                                "kpIcon": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1728035311295_karma-badge.svg",
                                "learners": [],
                                "customClass": "min-h-20",
                                "cardHeight": "64px",
                                "carMinHeight": "100px",
                                "hideEle": [
                                    "karma-points"
                                ]
                            }
                        }
                    ]
                },
                {
                    "active": true,
                    "enabled": true,
                    "title": "",
                    "key": "sectionMain",
                    "order": 3,
                    "wrapperClass": "",
                    "column": [
                        {
                            "active": true,
                            "enabled": true,
                            "key": "mainContent",
                            "title": "",
                            "colspan": 12,
                            "background": "",
                            "data": {
                                "tabSection": {
                                    "colspan": 8,
                                    "disable": true,
                                    "contentTab": [
                                        {
                                            "active": false,
                                            "enabled": false,
                                            "title": "Certifications of the Week",
                                            "navigation": true,
                                            "key": "sectionCertificationsOfWeeks",
                                            "order": 3,
                                            "navOrder": 1,
                                            "column": [
                                                {
                                                    "active": true,
                                                    "enabled": true,
                                                    "key": "contentcertificationsOfWeekStrip",
                                                    "title": "Recommended Courses",
                                                    "data": {
                                                        "sectionImagePosition": "img-left",
                                                        "sectionImage": "assets/icons/microsite/left_arrow.svg",
                                                        "order": 4,
                                                        "strips": [
                                                            {
                                                                "active": true,
                                                                "key": "certificationsOfWeek",
                                                                "logo": "school",
                                                                "title": "Certifications of the Week",
                                                                "stripTitleLink": {
                                                                    "link": "",
                                                                    "icon": ""
                                                                },
                                                                "customeClass": "min-width-763",
                                                                "sliderConfig": {
                                                                    "showNavs": true,
                                                                    "showDots": true,
                                                                    "maxWidgets": 12,
                                                                    "showNavsSpacing": true,
                                                                    "cerificateCardMargin": true
                                                                },
                                                                "loader": true,
                                                                "stripBackground": "",
                                                                "titleDescription": "Certifications of the Week",
                                                                "stripConfig": {
                                                                    "cardSubType": "card-wide-v2"
                                                                },
                                                                "loaderConfig": {
                                                                    "cardSubType": "card-wide-v2-skelton"
                                                                },
                                                                "viewMoreUrl": {
                                                                    "path": "/app/seeAll",
                                                                    "viewMoreText": "Show all",
                                                                    "queryParams": {
                                                                        "key": "certificationsOfWeek"
                                                                    },
                                                                    "loaderConfig": {
                                                                        "cardSubType": "card-portrait-click-skeleton"
                                                                    },
                                                                    "stripConfig": {
                                                                        "cardSubType": "card-portrait-click"
                                                                    }
                                                                },
                                                                "tabs": [],
                                                                "filters": [],
                                                                "request": {
                                                                    "trendingSearch": {
                                                                        "request": {
                                                                            "filters": {
                                                                                "contextType": [
                                                                                    "certifications"
                                                                                ],
                                                                                "organisation": "<orgID>"
                                                                            },
                                                                            "limit": 5
                                                                        },
                                                                        "responseKey": "certifications"
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            "active": false,
                                            "enabled": false,
                                            "title": "Trending",
                                            "navigation": true,
                                            "key": "sectionRecommendedProgram",
                                            "order": 3,
                                            "navOrder": 1,
                                            "column": [
                                                {
                                                    "active": true,
                                                    "enabled": true,
                                                    "key": "contentRecommendedProgramStrip",
                                                    "title": "Popular courses",
                                                    "data": {
                                                        "sectionImagePosition": "img-left",
                                                        "sectionImage": "assets/icons/microsite/left_arrow.svg",
                                                        "order": 4,
                                                        "strips": [
                                                            {
                                                                "active": true,
                                                                "customeClass": "width-238",
                                                                "key": "recommendedProgram",
                                                                "logo": "school",
                                                                "disableTranslate": true,
                                                                "title": "Trending",
                                                                "stripTitleLink": {
                                                                    "link": "",
                                                                    "icon": ""
                                                                },
                                                                "sliderConfig": {
                                                                    "showNavs": true,
                                                                    "showDots": true,
                                                                    "maxWidgets": 12,
                                                                    "showNavsSpacing": true
                                                                },
                                                                "stripBackground": "",
                                                                "titleDescription": "Recently Added",
                                                                "stripConfig": {
                                                                    "cardSubType": "card-portrait-lib"
                                                                },
                                                                "viewMoreUrl": {
                                                                    "path": "/app/seeAll",
                                                                    "viewMoreText": "Show all",
                                                                    "queryParams": {
                                                                        "key": "recentlyAdded"
                                                                    },
                                                                    "loaderConfig": {
                                                                        "cardSubType": "card-portrait-lib-skeleton"
                                                                    },
                                                                    "stripConfig": {
                                                                        "cardSubType": "card-portrait-lib"
                                                                    }
                                                                },
                                                                "loader": true,
                                                                "loaderConfig": {
                                                                    "cardSubType": "card-portrait-lib-skeleton"
                                                                },
                                                                "tabsType": "pills-tab",
                                                                "tabs": [
                                                                    {
                                                                        "label": "Courses",
                                                                        "value": "course",
                                                                        "computeDataOnClick": false,
                                                                        "computeDataOnClickKey": "",
                                                                        "requestRequired": true,
                                                                        "showTabDataCount": false,
                                                                        "maxWidgets": 12,
                                                                        "nodataMsg": "nocontent",
                                                                        "request": {
                                                                            "apiUrl": "/apis/proxies/v8/playList/read/<playlistKey>/<orgID>",
                                                                            "playlistRead": {
                                                                                "type": "MDO_RECOMMENDED_COURSES"
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        "label": "Programs",
                                                                        "value": "program",
                                                                        "computeDataOnClick": false,
                                                                        "computeDataOnClickKey": "",
                                                                        "requestRequired": true,
                                                                        "showTabDataCount": false,
                                                                        "maxWidgets": 12,
                                                                        "nodataMsg": "nocontent",
                                                                        "request": {
                                                                            "apiUrl": "/apis/proxies/v8/playList/read/<playlistKey>/<orgID>",
                                                                            "playlistRead": {
                                                                                "type": "MDO_RECOMMENDED_PROGRAMS"
                                                                            }
                                                                        }
                                                                    }
                                                                ],
                                                                "filters": [],
                                                                "request": {
                                                                    "apiUrl": "/apis/proxies/v8/playList/read/<playlistKey>/<orgID>",
                                                                    "playlistRead": {
                                                                        "type": "MDO_RECOMMENDED_PROGRAMS"
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            "active": false,
                                            "enabled": false,
                                            "title": "Featured",
                                            "navigation": true,
                                            "key": "sectionFeatureCourses",
                                            "order": 3,
                                            "navOrder": 1,
                                            "column": [
                                                {
                                                    "active": true,
                                                    "enabled": true,
                                                    "key": "contentFeaturedStrip",
                                                    "title": "Featured",
                                                    "data": {
                                                        "sectionImagePosition": "img-left",
                                                        "sectionImage": "assets/icons/microsite/left_arrow.svg",
                                                        "order": 4,
                                                        "strips": [
                                                            {
                                                                "active": true,
                                                                "customeClass": "width-238",
                                                                "key": "featuredCourses",
                                                                "logo": "school",
                                                                "disableTranslate": true,
                                                                "title": "Featured",
                                                                "stripTitleLink": {
                                                                    "link": "",
                                                                    "icon": ""
                                                                },
                                                                "sliderConfig": {
                                                                    "showNavs": true,
                                                                    "showDots": true,
                                                                    "maxWidgets": 12,
                                                                    "showNavsSpacing": true
                                                                },
                                                                "stripBackground": "",
                                                                "titleDescription": "Recently Added",
                                                                "stripConfig": {
                                                                    "cardSubType": "card-portrait-lib"
                                                                },
                                                                "viewMoreUrl": {
                                                                    "path": "/app/seeAll",
                                                                    "viewMoreText": "Show all",
                                                                    "queryParams": {
                                                                        "key": "recentlyAdded"
                                                                    },
                                                                    "loaderConfig": {
                                                                        "cardSubType": "card-portrait-lib-skeleton"
                                                                    },
                                                                    "stripConfig": {
                                                                        "cardSubType": "card-portrait-lib"
                                                                    }
                                                                },
                                                                "loader": true,
                                                                "loaderConfig": {
                                                                    "cardSubType": "card-portrait-lib-skeleton"
                                                                },
                                                                "tabsType": "pills-tab",
                                                                "tabs": [
                                                                    {
                                                                        "label": "Courses",
                                                                        "value": "course",
                                                                        "computeDataOnClick": false,
                                                                        "computeDataOnClickKey": "",
                                                                        "requestRequired": true,
                                                                        "showTabDataCount": false,
                                                                        "maxWidgets": 12,
                                                                        "nodataMsg": "nocontent",
                                                                        "request": {
                                                                            "apiUrl": "/apis/proxies/v8/playList/read/<playlistKey>/<orgID>",
                                                                            "playlistRead": {
                                                                                "type": "MDO_FEATURED_COURSES"
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        "label": "Programs",
                                                                        "value": "program",
                                                                        "computeDataOnClick": false,
                                                                        "computeDataOnClickKey": "",
                                                                        "requestRequired": true,
                                                                        "showTabDataCount": false,
                                                                        "maxWidgets": 12,
                                                                        "nodataMsg": "nocontent",
                                                                        "request": {
                                                                            "apiUrl": "/apis/proxies/v8/playList/read/<playlistKey>/<orgID>",
                                                                            "playlistRead": {
                                                                                "type": "MDO_FEATURED_PROGRAMS"
                                                                            }
                                                                        }
                                                                    }
                                                                ],
                                                                "filters": [],
                                                                "request": {
                                                                    "apiUrl": "/apis/proxies/v8/playList/read/<playlistKey>/<orgID>",
                                                                    "playlistRead": {
                                                                        "type": "MDO_FEATURED_COURSES"
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    ],
                                    "coreAreasTab": [
                                        {
                                            "active": false,
                                            "enabled": false,
                                            "title": "Core Expertise",
                                            "navigation": true,
                                            "key": "sectionCompetency",
                                            "order": 5,
                                            "navOrder": 3,
                                            "column": [
                                                {
                                                    "active": true,
                                                    "enabled": true,
                                                    "key": "competency",
                                                    "title": "",
                                                    "colspan": 12,
                                                    "background": "",
                                                    "data": []
                                                }
                                            ]
                                        }
                                    ],
                                    "tabs": [
                                        {
                                            "name": "content"
                                        },
                                        {
                                            "name": "Core Areas"
                                        }
                                    ]
                                },
                                "announcementSection": {
                                    "disable": true,
                                    "colspan": 4,
                                    "data": {
                                        "title": "Key Announcements",
                                        "logoUrl": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1728035426855_key-announcements1.svg",
                                        "mobileIcon": "https://portal.karmayogi.nic.in/content-store/content/do_114061893940887552115/artifact/do_114061893940887552115_1716539807520_campaign_black.svg",
                                        "header": {
                                            "background": "#1B4CA1",
                                            "color": "#FFFFFF"
                                        },
                                        "panelborder": "#1B4CA1",
                                        "panelBackground": "#FFFFFF",
                                        "listItem": {
                                            "border": "#F3962F",
                                            "background": "#FCEEDB"
                                        },
                                        "ViewMoreColor": "#1B4CA1",
                                        "pageSize": 15,
                                        "list": [
                                            {
                                                "value": "Hon. Chief Minister of Gujarat will launch MDO Channel of SPIPA on IGoT Karmayogi Portal on occasion of Good Governance Day.",
                                                "expanded": false
                                            },
                                            {
                                                "value": "Hon. Chief Minister of Gujarat will launch MDO Channel of SPIPA on IGoT Karmayogi Portal on occasion of Good Governance Day.",
                                                "expanded": false
                                            }
                                        ]
                                    }
                                },
                                "stateLearningWeekSection": {
                                    "lookerSection": {
                                        "active": true,
                                        "enabled": true,
                                        "key": "lookerSection",
                                        "title": "",
                                        "colspan": 12,
                                        "background": "banner",
                                        "data": {
                                            "header": {
                                                "headerText": "Performance Dashboard",
                                                "description": "View MDO performance based on their learning activities for the week, with real-time insights into progress, engagement, and development across various MDOs."
                                            },
                                            "lookerProDesktopUrl": "https://lookerstudio.google.com/embed/reporting/17028145-cdd5-459d-bb13-b3de2ef62aee/page/fyd9D",
                                            "lookerProMobileUrl": "https://lookerstudio.google.com/embed/reporting/17028145-cdd5-459d-bb13-b3de2ef62aee/page/fyd9D"
                                        }
                                    },
                                    "keyHighlights": {
                                        "enabled": true,
                                        "backgroundColor": "#FFFFFF",
                                        "titleMaxLength": 200,
                                        "content": [
                                            {
                                                "title": "Enroll in the courses and contribute to your continuous learning journey and growth"
                                            },
                                            {
                                                "title": "Be a learning champion - complete courses and inspire your peers on iGOT!"
                                            }
                                        ],
                                        "sliderData": {
                                            "styleData": {
                                                "borderRadius": "0",
                                                "customHeight": "100px",
                                                "bannerMeta": "visible",
                                                "dots": "hidden",
                                                "arrowsPlacement": "middle-inline",
                                                "responsive": {
                                                    "customHeight": "80px",
                                                    "bannerMetaAlign": "left",
                                                    "navigationArrows": "visible",
                                                    "dots": "hidden",
                                                    "arrowsPlacement": "middle-inline"
                                                }
                                            }
                                        }
                                    },
                                    "speakerOftheDay": {
                                        "enabled": false,
                                        "data": {
                                            "title": "Speaker of the day",
                                            "infoText": "Join insightful webinars and masterclasses hosted by prominent speakers and thought leaders.",
                                            "infoIcon": "https://portal.dev.karmayogibharat.net/content-store/orgStore/0135071359030722569/1726652230008_info_icon.svg",
                                            "sliderData": {
                                                "styleData": {
                                                    "borderRadius": "12px",
                                                    "customHeight": "",
                                                    "bannerMeta": "visible",
                                                    "bannerMetaClass": "cbp-card-1",
                                                    "responsive": {
                                                        "bannerMetaClass": "cbp-card-1"
                                                    }
                                                }
                                            },
                                            "list": [
                                                {
                                                    "title": "Ms Arushi Malhotra",
                                                    "description": "Beyond the Desk: Using Behavioral Science to Improve Workplace Well-Being",
                                                    "profileImage": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1742617698083_IMG_9084.jpg",
                                                    "identifier": "do_1142743067745812481229"
                                                },
                                                {
                                                    "title": "Prof Bimlesh Kumar Singh",
                                                    "description": "Maintenance of Transformers",
                                                    "profileImage": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1742617868268_Bimlesh.jpg",
                                                    "identifier": "do_1142743211854888961161"
                                                },
                                                {
                                                    "title": "Prof. Dr. Sanjukkta Bhaduril",
                                                    "description": "Resilient tourism infrastructure for Rajasthan Islands",
                                                    "profileImage": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1742618016728_Dr. Sanjukkta.jpeg",
                                                    "identifier": "do_1142743114401218561137"
                                                }
                                            ]
                                        }
                                    },
                                    "weekHighlights": {
                                        "enabled": true,
                                        "data": {
                                            "title": "Highlights of the week",
                                            "sliderData": {
                                                "styleData": {
                                                    "borderRadius": "12px",
                                                    "customHeight": "",
                                                    "bannerMetaClass": "cbp-card",
                                                    "responsive": {
                                                        "bannerMetaClass": "cbp-card"
                                                    }
                                                }
                                            },
                                            "list": [
                                                {
                                                    "title": "Get ready for Maharashtra Tech Learning Week",
                                                    "description": "Tech-Wari, Maharashtra’s Tech Learning Week, blends technology, tradition & transformation—empowering government employees for citizen-first governance through future-ready digital learning.",
                                                    "videoUrl": "https://portal.igotkarmayogi.gov.in/content-store/orgStore/0133783095823810560/1745394867601_IMG_8833.MP4"
                                                }
                                            ]
                                        }
                                    },
                                    "myprogress": {
                                        "enabled": true,
                                        "data": {
                                            "title": "Your week's progress",
                                            "infoText": "During Rajya Karmayogi Saptah, stay informed about your learning journey. Monitor your Learning Hours, and earn Certificates.",
                                            "infoIcon": "https://portal.dev.karmayogibharat.net/content-store/orgStore/0135071359030722569/1726652230008_info_icon.svg",
                                            "profleDetails": {},
                                            "hideEle": [
                                                "karma-points"
                                            ],
                                            "insights": {
                                                "data": {
                                                    "sliderData": {
                                                        "styleData": {
                                                            "borderRadius": "12px",
                                                            "customHeight": "83px",
                                                            "bannerMeta": "visible",
                                                            "bannerMetaClass": "cbp-card",
                                                            "responsive": {
                                                                "bannerMetaClass": "cbp-card",
                                                                "customHeight": "83px"
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "mdoLeaderboard": {
                                        "enabled": true,
                                        "data": {
                                            "title": "Leaderboard",
                                            "infoText": "Celebrate top performers! The leaderboard showcases the Departments and Organizations based on total learning hours earned during State Learning Week.",
                                            "infoIcon": "https://portal.dev.karmayogibharat.net/content-store/orgStore/0135071359030722569/1726652230008_info_icon.svg",
                                            "currentTab": "S",
                                            "customClass": "",
                                            "cardHeight": "",
                                            "carMinHeight": "",
                                            "searchHint": "Search Departments",
                                            "hideEle": [
                                                "karma-points"
                                            ],
                                            "options": [
                                                {
                                                    "label": "1 - 500",
                                                    "value": "XS"
                                                },
                                                {
                                                    "label": "501 - 1000",
                                                    "value": "S"
                                                },
                                                {
                                                    "label": "1001 - 5000",
                                                    "value": "M"
                                                },
                                                {
                                                    "label": "5001 and 20000",
                                                    "value": "L"
                                                },
                                                {
                                                    "label": "20001 and adove",
                                                    "value": "XL"
                                                }
                                            ]
                                        }
                                    },
                                    "mandatoryCourse": {
                                        "enabled": true,
                                        "navigation": true,
                                        "key": "sectionMandatoryCourses",
                                        "order": 3,
                                        "navOrder": 1,
                                        "column": [
                                            {
                                                "active": true,
                                                "enabled": true,
                                                "key": "contentMandatoryCoursesStrip",
                                                "data": {
                                                    "order": 4,
                                                    "strips": [
                                                        {
                                                            "active": true,
                                                            "title": "Recommended Courses for Maharashtra Tech Learning Week",
                                                            "titleClass": "mat-title",
                                                            "customeClass": "width-238",
                                                            "key": "Recommended Courses for Maharashtra Tech Learning Week",
                                                            "logo": "school",
                                                            "disableTranslate": true,
                                                            "stripTitleLink": {
                                                                "link": "",
                                                                "icon": ""
                                                            },
                                                            "sliderConfig": {
                                                                "showNavs": true,
                                                                "showDots": true,
                                                                "maxWidgets": 18,
                                                                "showNavsSpacing": true
                                                            },
                                                            "stripBackground": "",
                                                            "titleDescription": "Recommended Courses for Rajasthan state learning week",
                                                            "stripConfig": {
                                                                "cardSubType": "card-portrait-lib"
                                                            },
                                                            "loader": true,
                                                            "loaderConfig": {
                                                                "cardSubType": "card-portrait-lib-skeleton"
                                                            },
                                                            "filters": [],
                                                            "request": {
                                                                "apiUrl": "/apis/proxies/v8/playList/read/<playlistKey>/<orgID>",
                                                                "playlistRead": {
                                                                    "type": "Mdo_RECOMMENDED_COURSES_MAHARASHTRA"
                                                                }
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    },
                                    "exploreLearningContent": {
                                        "enabled": true,
                                        "strips": [
                                            {
                                                "active": true,
                                                "key": "featuredContents",
                                                "logo": "school",
                                                "title": "Explore Learning Contents",
                                                "titleClass": "mat-title",
                                                "type": "learningContent",
                                                "disableTranslate": true,
                                                "stripTitleLink": {
                                                    "link": "",
                                                    "icon": ""
                                                },
                                                "sliderConfig": {
                                                    "showNavs": true,
                                                    "showDots": true,
                                                    "maxWidgets": 100,
                                                    "showNavsSpacing": true
                                                },
                                                "stripBackground": "",
                                                "titleDescription": "For you",
                                                "stripConfig": {
                                                    "cardSubType": "card-portrait-lib",
                                                    "hideShowAll": true
                                                },
                                                "viewMoreUrl": {},
                                                "hideViewMoreUrl": true,
                                                "loader": true,
                                                "loaderConfig": {
                                                    "cardSubType": "card-portrait-lib-skeleton"
                                                },
                                                "tabs": [
                                                    {
                                                        "label": "Group A",
                                                        "value": "Group A",
                                                        "computeDataOnClick": false,
                                                        "disableTranslate": true,
                                                        "computeDataOnClickKey": "",
                                                        "requestRequired": true,
                                                        "showTabDataCount": false,
                                                        "maxWidgets": 100,
                                                        "nodataMsg": "no Data Course",
                                                        "contentShuffel": true,
                                                        "request": {
                                                            "apiUrl": "/apis/proxies/v8/playList/read/<playlistKey>/<orgID>",
                                                            "playlistRead": {
                                                                "type": "MDO_GROUP_A_MAHARASHTRA"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "label": "Group B",
                                                        "value": "Group B",
                                                        "computeDataOnClick": false,
                                                        "disableTranslate": true,
                                                        "computeDataOnClickKey": "",
                                                        "requestRequired": true,
                                                        "showTabDataCount": false,
                                                        "maxWidgets": 100,
                                                        "nodataMsg": "no Data Course",
                                                        "contentShuffel": true,
                                                        "request": {
                                                            "apiUrl": "/apis/proxies/v8/playList/read/<playlistKey>/<orgID>",
                                                            "playlistRead": {
                                                                "type": "MDO_GROUP_B_MAHARASHTRA"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "label": "Group C",
                                                        "value": "Group C",
                                                        "computeDataOnClick": false,
                                                        "disableTranslate": true,
                                                        "computeDataOnClickKey": "",
                                                        "requestRequired": true,
                                                        "showTabDataCount": false,
                                                        "maxWidgets": 100,
                                                        "nodataMsg": "no Data Course",
                                                        "contentShuffel": true,
                                                        "request": {
                                                            "apiUrl": "/apis/proxies/v8/playList/read/<playlistKey>/<orgID>",
                                                            "playlistRead": {
                                                                "type": "MDO_GROUP_C_MAHARASHTRA"
                                                            }
                                                        }
                                                    }
                                                ],
                                                "filters": [],
                                                "stripRequestType": "post",
                                                "stripRequestFor": "search",
                                                "onTabClickRequest": false,
                                                "request": {
                                                    "apiUrl": "/apis/proxies/v8/playList/read/<playlistKey>/<orgID>",
                                                    "playlistRead": {
                                                        "type": "ORG_FEATURED_COURSES"
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    "events": {
                                        "active": false,
                                        "enabled": false,
                                        "title": "Explore events",
                                        "navigation": true,
                                        "key": "sectionExploreEvents",
                                        "order": 3,
                                        "navOrder": 1,
                                        "column": [
                                            {
                                                "maxContent": 3,
                                                "active": true,
                                                "enabled": true,
                                                "key": "exploreEventsContent",
                                                "title": "Explore events",
                                                "defaultImage": "https://portal.dev.karmayogibharat.net/content-store/orgStore/01390354700029132834/1727084157602_Image.svg",
                                                "request": {
                                                    "locale": [
                                                        "en"
                                                    ],
                                                    "query": "",
                                                    "request": {
                                                        "query": "",
                                                        "filters": {
                                                            "resourceType": [
                                                                "Karmayogi Saptah",
                                                                "Karmayogi Talks",
                                                                "Rajya Karmayogi Saptah"
                                                            ],
                                                            "status": [
                                                                "Live"
                                                            ],
                                                            "contentType": "Event",
                                                            "category": "Event",
                                                            "startDate": "<startDateObj>"
                                                        },
                                                        "sort_by": {
                                                            "startDate": "desc"
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    "active": true,
                    "enabled": true,
                    "title": "",
                    "key": "sectionSupport",
                    "order": 5,
                    "customClass": "contact-us-wrapper mt-20",
                    "column": [
                        {
                            "active": true,
                            "enabled": true,
                            "key": "supportSection",
                            "title": "",
                            "colspan": 12,
                            "background": "banner",
                            "data": {
                                "title": "Maharashtra Tech Learning Week Dedicated Technical Support",
                                "thumbnail": "https://dev.karmayogibharat.net/assets/videoconference/thumbnail.png",
                                "text": "For any support required",
                                "date": "April 01, 2025 - May 09, 2025 ",
                                "time": "9:00am – 5:00pm · Time zone: Asia/Kolkata",
                                "technicalSupport": "For any technical issues please contact",
                                "plsContact": "igot-mh[at]mah[dot]gov[dot]in",
                                "plsContacts": "igot-mh@mah.gov.in"
                            }
                        }
                    ]
                }
            ]
        }

        this.langtranslations.languageSelectedObservable.subscribe(() => {
            if (localStorage.getItem('websiteLanguage')) {
                this.translate.setDefaultLang('en')
                const lang = localStorage.getItem('websiteLanguage')!
                this.translate.use(lang)
            }
        })

        this.iframeHeight = `${window.innerWidth * 0.667}px`
    }

    @HostListener('window:resize')
    onResize() {
        this.setWidth()
    }

    setWidth() {
        this.stripWidth = `${(window.innerWidth - 1200 + 135) / 2}px`

    }

    raiseTabClick(event) {
        this.eventSvc.raiseInteractTelemetry(
            {
                type: 'click',
                subType: 'mdo-leaderboard',
                id: `${event}-tab`,
            },
            {
            },
            {
                module: 'National Learning Week',
            }
        )
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.channnelName = params['channel']
            this.orgId = params['orgId']
            this.titles.push({
                title: this.channnelName, icon: '', url: 'none', disableTranslate: true,
            })
        })
        this.setWidth()
        // this.lookerProDesktopUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data?.lookerProDesktopUrl);
        this.getLookerProUrl()
    }

    hideKeyHightlight(event: any, learnerReview: any) {
        if (event) {
            learnerReview['hideSection'] = true
        }
    }

    getLookerProUrl() {
        this.sectionList.forEach((section: any) => {
            if (section.key === 'sectionLookerpro') {
                section.column.forEach((col: any) => {
                    if (col && col.key === 'lookerSection') {
                        if (this.isMobile) {
                            this.iframeHeight = col.data.mobileHeight || '400px'
                        } else {
                            this.iframeHeight = col.data.disableDynamicHeight ? col.data.desktopHeight : `${window.innerWidth * 0.667}px`
                        }
                        let desktopUrl = col.data.lookerProDesktopUrl
                        let mobileUrl = col.data.lookerProMobileUrl
                        this.lookerProUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.isMobile ? mobileUrl : desktopUrl)
                    }
                })
            }
        })
    }



    public tabClicked(tabEvent: MatTabChangeEvent) {
        this.raiseTelemetry(`${tabEvent.tab.textLabel} tab`)
    }
    hideContentStrip(event: any, colData: any) {

        if (event) {
            colData.contentStripData['hideSection'] = true
            this.contentTabEmptyResponseCount = this.contentTabEmptyResponseCount + 1
            // if(this.contentTabEmptyResponseCount === 4 ) {
            //   this.selectedIndex = 1
            // }
        }
    }

    triggerOpenDialog(event: boolean) {
        if (event) {
            this.showModal = true
            document.body.style.overflow = 'hidden'
        }
        this.raiseTelemetry('btn open key annoucements')
    }

    onClose() {
        this.showModal = false
        document.body.style.overflow = 'auto'
        this.raiseTelemetry('btn close key annoucements')
    }

    raiseTelemetryInteratEvent(event: any) {
        if (event && event.viewMoreUrl) {
            this.raiseTelemetry(`${event.stripTitle} ${event.viewMoreUrl.viewMoreText}`)
        }
        if (!this.isTelemetryRaised && event && !event.viewMoreUrl) {
            this.eventSvc.raiseInteractTelemetry(
                {
                    type: 'click',
                    subType: 'mdo-channel',
                    id: `${_.kebabCase(event.typeOfTelemetry.toLocaleLowerCase())}-card`,
                },
                {
                    id: event.identifier,
                    type: event.primaryCategory,
                },
                {
                    pageIdExt: `${_.kebabCase(event.primaryCategory.toLocaleLowerCase())}-card`,
                    module: WsEvents.EnumTelemetrymodules.LEARN,
                }
            )
            this.isTelemetryRaised = true
        }
    }

    raiseCompetencyTelemetry(name: string) {
        this.raiseTelemetry(`${name} core expertise`)
    }

    raiseTelemetry(name: string) {
        this.eventSvc.raiseInteractTelemetry(
            {
                type: 'click',
                subType: 'mdo-channel',
                id: `${_.kebabCase(name).toLocaleLowerCase()}`,
            },
            {},
            {
                module: WsEvents.EnumTelemetrymodules.LEARN,
            }
        )
    }

    hideCompetency(event: any) {
        if (event) {
            this.hideCompetencyBlock = true
        }
    }

    showAllContent(_stripData: any, columnData: any) {
        if (columnData && columnData.contentStrip && columnData.contentStrip.strips && columnData.contentStrip.strips.length) {
            const stripData: any = _stripData
            let tabSelected = stripData.viewMoreUrl && stripData.viewMoreUrl.queryParams && stripData.viewMoreUrl.queryParams.tabSelected && stripData.viewMoreUrl.queryParams.tabSelected || ''
            this.router.navigate(
                [`/app/learn/mdo-channels/${this.channnelName}/${this.orgId}/all-content`],
                { queryParams: { tabSelected, key: columnData.sectionKey } })
        }
    }

    isArray(value: any): boolean {
        return Array.isArray(value)
    }

    getBackgroundStyle(background: string): any {
        if (!background) {
            return {
                'background': `url('/assets/icons/microsite/MDO-channel-banner.png') center center / cover no-repeat`
            }
        }

        // Check if it's a hex color (starts with #)
        if (background.startsWith('#')) {
            return { 'background-color': background }
        }

        // Otherwise, treat it as an image URL - return all background properties
        return {
            'background': `url('${background}') center center / cover no-repeat`
        }
    }

}
