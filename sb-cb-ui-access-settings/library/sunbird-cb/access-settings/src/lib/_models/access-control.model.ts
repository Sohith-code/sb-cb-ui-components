export namespace NsAccessControlConfig {
  export interface IAccessControlConfig {
    accessControlCriteriaSelection: IAccessControlCriteriaSelection;
    usersTableConfig: ITableConfig;
    bulkUploadKarmayogi: IBulkUploadKarmayogi;
    accessControlGuide: IAccessControlGuide;
    visiblilityOnOff: IVisiblilityOnOff;
    userConfig: { [key: string]: any; userRoles: any };
    content: any;
  }
  export interface IAccessControlCriteriaSelection {
    optionsEntity: IOptionsEntity[];
    optionsConditions: IOptionsCondition[];
    organizationRadioSelection: ISelectionOption[];
    designationRadioSelection: ISelectionOption[];
    servicesRadioSelection: ISelectionOption[];
    cadreRadioSelection: ISelectionOption[];
    batchRadioSelection: ISelectionOption[];
    groupsOptions: string[];
    verificationStatus: ISelectionOption[];
    accessTypes: { name: string; value: string; tooltip: string; disabled: boolean }[];
    readOnly: boolean;
  }

  export interface IOptionsEntity {
    value: string;
    label: string;
    disabled: boolean;
  }

  export interface IOptionsCondition {
    value: string;
    label: string;
  }

  export interface ITableConfig {
    allLearners: ITableParameters;
    selectedUsers: ITableParameters;
    bulkUploadTable: ITableParameters;
  }

  export interface ITableParameters {
    displayedColumns: string[];
    type: string;
    initialPaginationSize: number;
    initialPaginationSizeOptions: number[];
    canShowPagination: boolean;
    canShowMasterSelect: boolean;
    canShowRefreshBtn: boolean;
    canShowDeleteBtn: boolean;
    canShowSelectedItems: boolean;
    canSortColumn: boolean;
  }
  export type IUserTableType = "allLearners" | "selectedUsers" | "bulkUploadTable";

  export type IManageSelectionType = "add_karmayogis" | "bulk_upload_karmayogis";

  export interface IBulkUploadKarmayogi {
    uploadInstructions: string[];
    downloadSampleFile: {
      path: string;
      fileName: string;
    };
    bulkUploadTable: ITableParameters;
  }

  export enum SelectionType {
    Users = "user",
    Organizations = "rootOrgId",
    Group = "group",
    Designation = "designation",
    VerificationStatus = "profilestatus",
    Cadre = "Cadre",
    Service = "service",
    Batch = "batch"
  }

  export interface ISelectionOption {
    value: string;
    label: string;
  }

  export enum IActions {
    Confirm = "confirm",
    Reject = "reject"
  }

  export enum IAccessTypes {
    Public = "public",
    Custom = "custom"
  }

  export type ITypeAccessType = "public" | "custom";
  export interface IAccessControlGuide {
    summaryText: string;
    canShowSummaryTab: boolean;
    canShowTranscriptTab: boolean;
    instructionVideoPath: string;
  }

  export enum IAccessSetting {
    ALL_USERS = "allUsers",
    MDO_SPECIFIC = "mdoSpecific",
    CUSTOME_USER = "customeUser"
  }
}

export interface IUserGroupRequest {
  contentId: string;
  accessControl: {
    version: number;
    userGroups: {
      userGroupId: string;
      userGroupName: string;
      userGroupCriteriaList: {
        userGroupKey: string;
        userGroupValue: string[];
      }[];
    }[];
  };
}

export interface IVisiblilityOnOff {
  label: string;
  disabled: boolean;
  on: string;
  off: string;
  default: string;
}
