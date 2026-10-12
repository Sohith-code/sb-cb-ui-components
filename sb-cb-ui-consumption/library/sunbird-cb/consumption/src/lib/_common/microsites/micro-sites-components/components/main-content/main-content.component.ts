import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core'
import { MatTabChangeEvent } from '@angular/material/tabs'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { MicrositeV3Service } from '../../../../../_services/microsite-v3.service'
import { v4 as uuid } from 'uuid'
import { MatDialog } from '@angular/material/dialog'
import { StripAddContentComponent } from '../strip-add-content/strip-add-content.component'
import { AddTabDialogComponent } from '../add-tab-dialog/add-tab-dialog.component'
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component'
import { getTabSectionDataKey } from '../../../tab-section.util'

@Component({
    selector: 'app-main-content',
    templateUrl: './main-content.component.html',
    styleUrls: ['./main-content.component.scss'],
    standalone: false
})
export class MainContentComponent implements OnInit {
  selectedIndex = 0;
  hideCompetencyBlock = false;
  contentTabEmptyResponseCount = 0;
  getTabDataKey = getTabSectionDataKey;
  showModal = false;
  stripSections: any[] = [];
  sectionData: any

  constructor(
    @Inject('sectionData') public data: any,
    @Inject('channelName') public channelName: string,
    @Inject('orgId') public orgId: string,
    @Inject('isMobile') public isMobile: boolean,
    @Inject('providerId') public providerId: string,
    @Inject('slwConfiguration') public slwConfig: any,
    @Inject('isEdit') public isEdit: boolean,
    @Inject('eventCallback') private eventCallback: (event: any) => void,
    public configSvc: ConfigurationsService,
    public microSiteV3Service: MicrositeV3Service,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Initialization logic
    // Initialize stripSections from existing data if available
    if (this.data?.stripSections && Array.isArray(this.data.stripSections)) {

      this.stripSections = [...this.data.stripSections]
    }
  }

  tabClicked(event: MatTabChangeEvent) {
    this.selectedIndex = event.index
    this.eventCallback({
      action: 'tab-click',
      source: 'mainContent',
      id: `${event.tab.textLabel}-tab`
    })
  }

  raiseTabClick(event: any) {
    this.eventCallback({
      action: 'mdo-leaderboard',
      source: 'mainContent',
      id: `${event}-tab`
    })
  }

  hideKeyHightlight(event: any, data: any) {
    if (event) {
      data.enabled = false
      this.eventCallback({
        action: 'hide-highlight',
        source: 'mainContent',
        id: 'key-highlight'
      })
    }
  }

  triggerOpenDialog(event: boolean) {
    if (event) {
      this.showModal = true
      document.body.style.overflow = 'hidden'
    }
    this.eventCallback({
      action: 'open-dialog',
      source: 'mainContent',
      id: 'key-announcements'
    })
  }

  onClose() {
    this.showModal = false
    document.body.style.overflow = 'auto'
    this.eventCallback({
      action: 'close-dialog',
      source: 'mainContent',
      id: 'key-announcements'
    })
  }

  raiseTelemetryInteratEvent(event: any) {
    this.eventCallback({
      action: 'telemetry',
      source: 'mainContent',
      id: event.id || 'content-interaction',
      data: event
    })
  }

  showAllContent(event: any, data: any) {
    this.eventCallback({
      action: 'view-all',
      source: 'mainContent',
      id: data?.sectionKey || 'content-section',
      data: event
    })
  }

  hideCompetency(event: any) {
    if (event) {
      this.hideCompetencyBlock = true
      this.eventCallback({
        action: 'hide-competency',
        source: 'mainContent',
        id: 'competency-block'
      })
    }
  }

  raiseCompetencyTelemetry(name: string) {
    this.eventCallback({
      action: 'competency-click',
      source: 'mainContent',
      id: `${name}-core-expertise`
    })
  }

  openEditor(fieldName: string, displayName: string, value: any) {
    this.eventCallback({
      action: 'edit',
      source: 'mainContent',
      id: fieldName,
      data: {
        fieldName,
        displayName,
        value,
        fieldType: this.getFieldType(fieldName, value),
        parentData: this.data
      }
    })
  }

  getFieldType(fieldName: string, value: any): string {
    if (fieldName === 'keyHighlights') return 'keyHighlights'
    // Add other field type logic as needed
    return typeof value
  }

  addNewSection() {
    let sectionNumber = 1
    let sectionName = 'Section One'
    let sectionKey = 'sectionOne'

    if (this.stripSections && this.stripSections.length > 0) {
      // Increment section number based on existing sections count
      sectionNumber = this.stripSections.length + 1
      const numberWords = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

      if (sectionNumber <= numberWords.length) {
        const numberWord = numberWords[sectionNumber - 1]
        sectionName = `Section ${numberWord}`
        sectionKey = `section${numberWord}`
      } else {
        // For numbers beyond ten, use numeric format
        sectionName = `Section ${sectionNumber}`
        sectionKey = `mdo_section`
      }
    }

    // Use array reassignment to trigger change detection
    const newSection = this.microSiteV3Service.getCreateSectionReq(sectionName, `${sectionKey}_${uuid()}`, true)
    this.stripSections = [...this.stripSections, newSection]

    // Force change detection
    this.cdr.detectChanges()
  }

  removeSection(index: number) {
    // Use array filter to create new array reference for change detection
    this.stripSections = this.stripSections.filter((_, i) => i !== index)

    // Force change detection
    this.cdr.detectChanges()
  }

  notifyStripSectionsChange() {
    // Notify parent component about stripSections changes
    this.eventCallback({
      action: 'update-strip-sections',
      source: 'mainContent',
      id: 'strip-sections-updated',
      data: { stripSections: this.stripSections }
    })
  }

  onEditStripContent(event: any) {
    const { stripKey, stripData, tab } = event
    if (event?.isAddNewTab) {
      this.sectionData = this.data.stripsArray.find((stripItem: any) => {
        return stripItem?.strips?.[0]?.key === stripKey
      })
      this.openAddTabDialog()
    } else if (stripData?.tabs?.length > 0 && !event?.isTabEdit && !event?.isRemoveTab) {
      this.openAddTabDialog(stripData)
    } else if (event?.isRemoveTab) {
      this.removeTab(stripData?.tabs?.indexOf(event.tab), stripData)
    } else {
      const dialogRef = this.dialog.open(StripAddContentComponent, {
        width: '1000px',
        height: '80vh',
        maxHeight: '800px',
        data: {
          sectionIndex: 0,
          sectionData: {
            enabled: true,
            strips: [stripData],
          },
          tabData: tab
        },
        position: { top: '50px' },
        autoFocus: false
      })

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.selectedItems && result.selectedItems.length > 0) {
          const contentIds: string[] = []
          result.selectedItems.forEach((item: any) => {
            if (!contentIds.includes(item.identifier)) {
              contentIds.push(item.identifier)
            }
          })
          if (Object.keys(result?.tabDetails)?.length > 0) {
            if (result.tabDetails.request.playlistRead.type) {
              this.updatePlaylist(stripData, result.tabDetails.request.playlistRead.type, contentIds, result.allOrgContent)
            } else {
              this.createPlaylist(stripData, contentIds, result.allOrgContent, result.tabDetails)
            }

          } else {
            this.updatePlaylist(stripData, result.requestData.playlistRead.type, contentIds, result.allOrgContent)
          }
        }
      })
    }
  }

  createPlaylist(stripData: any, contentIds: string[], allOrgContent: boolean, tabDetails: any) {
    let tempType = ``
    if (tabDetails) {
      tempType = `MDO_${tabDetails?.value?.split(' ').join('_')}_${uuid()}_ALLCONTENT_${allOrgContent ? 'TRUE' : 'FALSE'}`
    }
    const requestBody = {
      type: tempType,
      orgId: this.configSvc.userProfile?.rootOrgId || '',
      ownerId: this.configSvc.userProfile?.userId,
      children: contentIds
    }
    this.microSiteV3Service.createPlaylistApi(requestBody).subscribe(
      (response) => {
        if (response?.result?.status?.toLowerCase() === 'created') {
          if (tabDetails) {
            stripData.tabs = stripData.tabs.map((tab: any) => {
              if (tab.value === tabDetails.value) {
                tab.request = {
                  apiUrl: "/apis/proxies/v8/playList/read/<playlistKey>/<orgID>",
                  playlistRead: {
                    type: requestBody.type,
                  }
                }
                tab.requestRequired = true
              }
              return tab
            })
          }

          // Trigger a refresh or notify parent to clear injector cache
          this.eventCallback({
            action: 'playlist-updated',
            source: 'mainContent',
            id: 'strip-content-updated',
            data: { stripData },
            clearCache: true  // Request parent to clear injector cache
          })
        }
      },
      (error) => {
        console.error('Error creating playlist:', error)
      }
    )
  }

  updatePlaylist(stripData: any, playlistReadType: any, contentIds: string[], allOrgContent: boolean) {
    const requestBody = {
      type: playlistReadType,
      orgId: this.configSvc.userProfile?.rootOrgId || '',
      ownerId: this.configSvc.userProfile?.userId,
      children: contentIds
    }

    this.microSiteV3Service.updatePlaylistApi(requestBody).subscribe(
      (response) => {
        if (response?.result?.status?.toLowerCase() === 'updated') {
          // Trigger a refresh or notify parent to clear injector cache
          this.eventCallback({
            action: 'playlist-updated',
            source: 'mainContent',
            id: 'strip-content-updated',
            data: { stripData },
            clearCache: true  // Request parent to clear injector cache
          })
        }
      },
      (error) => {
        console.error('Error updating playlist:', error)
      }
    )
  }

  onToggleSectionVisibility(event: any) {
    const { stripKey, stripSections, enabled } = event

    // Find the matching strip in stripsArray and update its enabled state
    if (this.data?.stripsArray && Array.isArray(this.data.stripsArray)) {
      const matchingStrip = this.data.stripsArray.find((stripItem: any) => {
        return stripItem?.strips?.[0]?.key === stripKey
      })
      if (matchingStrip) {
        matchingStrip.enabled = enabled
      }
    }

    // Update the section's enabled state
    if (stripSections) {
      stripSections.enabled = enabled
    }

    // Force change detection to refresh the view
    this.cdr.detectChanges()

    // Notify parent component about the change
    this.eventCallback({
      action: 'section-visibility-toggled',
      source: 'mainContent',
      id: 'strip-visibility-changed',
      data: { stripKey, stripSections, enabled }
    })
  }

  onRemoveStrip(event: any) {
    const { stripKey, stripData } = event

    // Remove the strip from stripsArray using stripKey
    if (this.data?.stripsArray && Array.isArray(this.data.stripsArray)) {
      this.data.stripsArray = this.data.stripsArray.filter((stripItem: any) => {
        return stripItem?.strips?.[0]?.key !== stripKey
      })
    }

    // Force change detection
    this.cdr.detectChanges()

    // Notify parent component about the removal
    this.eventCallback({
      action: 'strip-removed',
      source: 'mainContent',
      id: 'strip-deleted',
      data: { stripKey, stripData }
    })
  }

  trackByIndex(index: number, item: any): number {
    return index
  }

  onPlaylistCreated(event: any) {
    // Add the new section to data.stripsArray if it doesn't exist
    if (!this.data.stripsArray) {
      this.data.stripsArray = []
    }

    // Update or add the section data
    const existingIndex = this.data.stripsArray.findIndex((item: any) =>
      item?.strips?.[0]?.key === event.sectionData?.strips?.[0]?.key
    )

    if (existingIndex === -1) {
      // Add new section to stripsArray using array reassignment
      this.data.stripsArray = [...this.data.stripsArray, event.sectionData]
    } else {
      // Update existing section
      this.data.stripsArray[existingIndex] = event.sectionData
      // Reassign to trigger change detection
      this.data.stripsArray = [...this.data.stripsArray]
    }

    // Remove the section from stripSections array after playlist is created
    const stripSectionIndex = event.sectionIndex
    if (stripSectionIndex !== undefined && this.stripSections[stripSectionIndex]) {
      this.stripSections = this.stripSections.filter((_, i) => i !== stripSectionIndex)
    }

    // Force change detection
    this.cdr.detectChanges()

    // Notify parent component
    this.eventCallback({
      action: 'playlist-created',
      source: 'mainContent',
      id: 'new-playlist-created',
      data: event
    })
  }

  openAddTabDialog(stripData?: any) {
    const dialogRef = this.dialog.open(AddTabDialogComponent, {
      width: '500px',
      disableClose: false,
      autoFocus: false,
      data: stripData
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.trim() && !stripData) {
        this.addTab(result.trim())
      } else if (stripData) {
        stripData.title = (result) ? result?.trim() : stripData.title
        this.eventCallback({
          action: 'playlist-updated',
          source: 'mainContent',
          id: 'strip-content-updated',
          data: { stripData },
          clearCache: true  // Request parent to clear injector cache
        })
      }
    })
  }

  addTab(title: string) {
    if (!this.sectionData.strips[0].tabs) {
      this.sectionData.strips[0].tabs = []
    }

    // Create new tab object with minimal structure for edit mode
    const newTab = {
      label: title,
      value: title,
      computeDataOnClick: false,
      disableTranslate: true,
      computeDataOnClickKey: "",
      requestRequired: false,  // Set to false to prevent API calls in edit mode
      showTabDataCount: false,
      maxWidgets: 100,
      nodataMsg: "No content available",
      contentShuffel: true,
      request: {
        apiUrl: '',
        playlistRead: {
          type: ''
        }
      }
    }
    this.sectionData.strips[0].tabs = [...this.sectionData.strips[0].tabs, newTab]
    this.cdr.detectChanges()
    // Notify parent component
    this.eventCallback({
      action: 'playlist-created',
      source: 'mainContent',
      id: 'new-playlist-created',
      data: event
    })
  }

  removeTab(index: number, stripData: any) {
    if (!stripData?.tabs) {
      return
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Remove Tab',
        message: 'Are you sure you want to remove this tab? This action cannot be undone.',
        confirmText: 'Remove',
        cancelText: 'Cancel',
      },
      autoFocus: false
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Create new array without the item at index to trigger change detection
        stripData.tabs = stripData.tabs.filter((_, i) => i !== index)
        this.eventCallback({
          action: 'playlist-updated',
          source: 'mainContent',
          id: 'strip-content-updated',
          data: { stripData },
          clearCache: true  // Request parent to clear injector cache
        })
      }
    })
  }
}
