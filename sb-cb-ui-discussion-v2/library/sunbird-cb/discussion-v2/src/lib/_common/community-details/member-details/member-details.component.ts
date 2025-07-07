import { Component, Input, OnInit } from '@angular/core';
import { DiscussionV2Service } from '../../../_services/discussion-v2.service';

@Component({
  selector: 'd-v2-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.scss']
})
export class MemberDetailsComponent implements OnInit{
  @Input() communityId = '';
  communityMembersList: any = []
  limit: number = 10
  offset: number = 0
  totalNumberOfMembers: any = 0
  membersLoading:Boolean = false
  constructor(private discussV2Svc: DiscussionV2Service){

  }

  ngOnInit() {
    this.getAllMembersOfCommunity();
  }
  getAllMembersOfCommunity(){
    this.membersLoading = true
    let request = {
      "communityId":this.communityId,
      "offset" :this.offset,
      "limit" : this.limit
    }
    this.discussV2Svc.communityUserList(request).subscribe((res: any) => {
      
      this.membersLoading = false
      if(res.result && res.result && res.result.userDetails  && res.result.userDetails.length){
        this.communityMembersList = [...this.communityMembersList,...res.result.userDetails];
        this.totalNumberOfMembers =  res.result.usersJoinedCount
      }
    })
  }
  onSearch(event: any){
    this.membersLoading = true
   let typeText: any  = event && event?.target && event?.target?.value || ''
  let request = {
    "request": {
        "filters": {
            "discussionCommunities": [
                this.communityId
            ]
        },
        "query" : typeText,
        "fields": [
            "id",
            "userName","firstName", "rootOrgName",
            "profileDetails.profileImageUrl",
            "profileDetails.employmentDetails.departmentName"
        ]
    }
  }
  this.discussV2Svc.userSearch(request).subscribe((res: any)=> {
    this.membersLoading = false
    if(res && res.result && res.result.response && res.result.response.content && res.result.response.content.length
      && res.result.response.content.length > 0
    ) {
      this.communityMembersList = res?.result?.response?.content
      this.totalNumberOfMembers =  res?.result?.response?.count
      
    } else {  
      this.communityMembersList = []
      this.totalNumberOfMembers = 0
    }
  })
  }
  loadMoreMembers(){
    if( !(this.communityMembersList?.length >= this.totalNumberOfMembers)) {
      this.offset = this.offset + 1
      this.getAllMembersOfCommunity()
    }
  }
}
