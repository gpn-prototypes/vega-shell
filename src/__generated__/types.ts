export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: any;
  /**
   * Leverages the internal Python implmeentation of UUID (uuid.UUID) to provide native UUID objects
   * in fields, resolvers and input.
   */
  UUID: any;
  DictType: any;
};

export type Query = {
  __typename?: 'Query';
  projectLibrarylist?: Maybe<Array<Maybe<ProjectLibrary>>>;
  projectLibrary?: Maybe<ProjectLibrary>;
  projectLibraryCategoriesList?: Maybe<Array<Maybe<ProjectLibraryCategory>>>;
  projectLibraryCategories?: Maybe<ProjectLibraryCategory>;
  componentList?: Maybe<Array<Maybe<Component>>>;
  component?: Maybe<Component>;
  componentCategoriesList?: Maybe<Array<Maybe<ComponentLibraryCategory>>>;
  componentCategories?: Maybe<ComponentLibraryCategory>;
  assemblyList?: Maybe<Array<Maybe<Assembly>>>;
  assembly?: Maybe<Assembly>;
  assemblyCategoriesList?: Maybe<Array<Maybe<AssemblyLibraryCategory>>>;
  assemblyCategories?: Maybe<AssemblyLibraryCategory>;
  activityList?: Maybe<Array<Maybe<Activity>>>;
  activity?: Maybe<Activity>;
  activityCategoriesList?: Maybe<Array<Maybe<ActivityLibraryCategory>>>;
  activityCategories?: Maybe<ActivityLibraryCategory>;
  domainTemplatelist?: Maybe<Array<Maybe<DomainTemplate>>>;
  domainTemplate?: Maybe<DomainTemplate>;
  domainTemplateCategoriesList?: Maybe<Array<Maybe<DomainTemplateLibraryCategory>>>;
  domainTemplateCategories?: Maybe<DomainTemplateLibraryCategory>;
  userList?: Maybe<Array<Maybe<User>>>;
  user?: Maybe<User>;
  projectRoleList?: Maybe<Array<Maybe<ProjectRole>>>;
  projectRole?: Maybe<ProjectRole>;
  attachmentTypeList?: Maybe<Array<Maybe<AttachmentType>>>;
  attachmentType?: Maybe<AttachmentType>;
  userGroupList?: Maybe<Array<Maybe<UserGroup>>>;
  userGroup?: Maybe<UserGroup>;
  organizationList?: Maybe<Array<Maybe<Organization>>>;
  organization?: Maybe<Organization>;
  organizationUnitList?: Maybe<Array<Maybe<OrganizationUnit>>>;
  organizationUnit?: Maybe<OrganizationUnit>;
  countryList?: Maybe<Array<Maybe<Country>>>;
  country?: Maybe<Country>;
  regionList?: Maybe<Array<Maybe<Region>>>;
  region?: Maybe<Region>;
  attachmentList?: Maybe<Array<Maybe<Attachment>>>;
  attachment?: Maybe<Attachment>;
  jtiBlackListEntryList?: Maybe<Array<Maybe<JtiBlackListEntry>>>;
  jtiBlackListEntry?: Maybe<JtiBlackListEntry>;
  domainEntityList?: Maybe<Array<Maybe<DomainEntity>>>;
  domainEntity?: Maybe<DomainEntity>;
  project?: Maybe<ProjectOrError>;
  projectList?: Maybe<ProjectListOrError>;
  me?: Maybe<User>;
};


export type QueryProjectLibraryArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryProjectLibraryCategoriesArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryComponentArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryComponentCategoriesArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryAssemblyArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryAssemblyCategoriesArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryActivityArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryActivityCategoriesArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryDomainTemplateArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryDomainTemplateCategoriesArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryUserArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryProjectRoleArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryAttachmentTypeArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryUserGroupArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryOrganizationArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryOrganizationUnitArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryCountryArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryRegionArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryAttachmentArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryJtiBlackListEntryArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryDomainEntityArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type QueryProjectArgs = {
  vid?: Maybe<Scalars['UUID']>;
  version?: Maybe<Scalars['Int']>;
};


export type QueryProjectListArgs = {
  includeBlank?: Maybe<Scalars['Boolean']>;
  pageNumber?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
};

export type ProjectLibrary = {
  __typename?: 'ProjectLibrary';
  category?: Maybe<ProjectLibraryCategory>;
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type ProjectLibraryCategory = {
  __typename?: 'ProjectLibraryCategory';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<ProjectLibraryCategory>;
};



export type Component = {
  __typename?: 'Component';
  category?: Maybe<ComponentLibraryCategory>;
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type ComponentLibraryCategory = {
  __typename?: 'ComponentLibraryCategory';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<ComponentLibraryCategory>;
};

export type Assembly = {
  __typename?: 'Assembly';
  category?: Maybe<AssemblyLibraryCategory>;
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type AssemblyLibraryCategory = {
  __typename?: 'AssemblyLibraryCategory';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<AssemblyLibraryCategory>;
};

export type Activity = {
  __typename?: 'Activity';
  category?: Maybe<ActivityLibraryCategory>;
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type ActivityLibraryCategory = {
  __typename?: 'ActivityLibraryCategory';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<ActivityLibraryCategory>;
};

export type DomainTemplate = {
  __typename?: 'DomainTemplate';
  category?: Maybe<DomainTemplateLibraryCategory>;
  entity?: Maybe<DomainEntity>;
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  attributes?: Maybe<Array<Maybe<PropertyMeta>>>;
};

export type DomainTemplateLibraryCategory = {
  __typename?: 'DomainTemplateLibraryCategory';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<DomainTemplateLibraryCategory>;
};

export type DomainEntity = {
  __typename?: 'DomainEntity';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
};

/**
 * Model to description object attributes.
 * 
 *     Model attributes:
 *         title - civil attribute name by user native language
 *         name - technical attribute name
 *         attr_type - attributes data type, must be mapped to marshmellow types,
 *                     example: Str, Int, RefLink('Model')
 *         unit - Attributes unit, example: km^2, m^3
 *         validation_rules - Rules for validation object attribute value
 */
export type PropertyMeta = {
  __typename?: 'PropertyMeta';
  title?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  entity?: Maybe<DomainEntity>;
  attrType?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['String']>;
  validationRules?: Maybe<ValidationRules>;
  description?: Maybe<Scalars['String']>;
  required?: Maybe<Scalars['Boolean']>;
};

/**
 * Validation Rules.
 * 
 *     Todo:
 *     1. Develop valudation rule syntax
 *     2. Realize validate value by valudation rules
 */
export type ValidationRules = {
  __typename?: 'ValidationRules';
  rules?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type User = {
  __typename?: 'User';
  name?: Maybe<Scalars['String']>;
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  login?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  patronym?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  adId?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  favoriteProjects?: Maybe<Array<Maybe<Scalars['ID']>>>;
  organizationUnits?: Maybe<Array<Maybe<OrganizationUnit>>>;
  groups?: Maybe<Array<Maybe<UserGroup>>>;
};

export type OrganizationUnit = {
  __typename?: 'OrganizationUnit';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  organization?: Maybe<Organization>;
  parentOu?: Maybe<OrganizationUnit>;
  adId?: Maybe<Scalars['String']>;
};

export type Organization = {
  __typename?: 'Organization';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
};

export type UserGroup = {
  __typename?: 'UserGroup';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  project?: Maybe<Scalars['ID']>;
};

export type ProjectRole = {
  __typename?: 'ProjectRole';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  defaultAttachmentType?: Maybe<AttachmentType>;
};

export type AttachmentType = {
  __typename?: 'AttachmentType';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
};

export type Country = {
  __typename?: 'Country';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  coordinateSystems?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type Region = {
  __typename?: 'Region';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  fullName?: Maybe<Scalars['String']>;
  country?: Maybe<Country>;
};

export type Attachment = {
  __typename?: 'Attachment';
  extension?: Maybe<Scalars['String']>;
  uri?: Maybe<Scalars['String']>;
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  createdBy?: Maybe<User>;
  editedBy?: Maybe<User>;
  comment?: Maybe<Scalars['String']>;
  category?: Maybe<AttachmentType>;
  contentType?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['Int']>;
  projectId?: Maybe<Scalars['ID']>;
  size?: Maybe<Scalars['Int']>;
};

export type JtiBlackListEntry = {
  __typename?: 'JtiBlackListEntry';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  jti?: Maybe<Scalars['String']>;
  exp?: Maybe<Scalars['Int']>;
};

export type ProjectOrError = Project | Error | ValidationError;

export type Project = {
  __typename?: 'Project';
  isFavorite?: Maybe<Scalars['Boolean']>;
  attendeesTotal?: Maybe<Scalars['Int']>;
  filesTotal?: Maybe<Scalars['Int']>;
  files?: Maybe<Array<Maybe<Attachment>>>;
  attendees?: Maybe<Array<Maybe<Attendee>>>;
  domainSchema?: Maybe<DomainSchema>;
  versions: Array<Maybe<Scalars['Int']>>;
  myRoles?: Maybe<Array<Maybe<ProjectRole>>>;
  recentlyEdited: Scalars['Boolean'];
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  isDeleted?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  editedAt?: Maybe<Scalars['DateTime']>;
  type?: Maybe<ProjectTypeEnum>;
  createdBy?: Maybe<User>;
  editedBy?: Maybe<User>;
  adId?: Maybe<Scalars['String']>;
  authorOu?: Maybe<OrganizationUnit>;
  region?: Maybe<Region>;
  coordinates?: Maybe<Scalars['String']>;
  coordinateSystem?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  rootEntity?: Maybe<Scalars['String']>;
  status?: Maybe<ProjectStatusEnum>;
  resourceId?: Maybe<Scalars['String']>;
  yearStart?: Maybe<Scalars['Int']>;
  yearEnd?: Maybe<Scalars['Int']>;
  version?: Maybe<Scalars['Int']>;
};


export type ProjectAttendeesArgs = {
  orderBy?: Maybe<Array<Maybe<AttendeeOrderBy>>>;
  sortBy?: Maybe<SortType>;
};

export type Attendee = {
  __typename?: 'Attendee';
  user?: Maybe<User>;
  roles?: Maybe<Array<Maybe<ProjectRole>>>;
  status?: Maybe<AttendeeStatus>;
};

export enum AttendeeStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

export enum AttendeeOrderBy {
  FirstName = 'FIRST_NAME',
  Patronym = 'PATRONYM',
  LastName = 'LAST_NAME',
  Name = 'NAME',
  Role = 'ROLE'
}

export enum SortType {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type DomainSchema = {
  __typename?: 'DomainSchema';
  entityImages?: Maybe<Array<Maybe<DomainEntityImage>>>;
  version?: Maybe<Scalars['String']>;
};

export type DomainEntityImage = {
  __typename?: 'DomainEntityImage';
  vid?: Maybe<Scalars['ID']>;
  code?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  entity?: Maybe<DomainEntity>;
  attributes?: Maybe<Array<Maybe<PropertyMeta>>>;
  description?: Maybe<Scalars['String']>;
};

/** An enumeration. */
export enum ProjectTypeEnum {
  Geo = 'GEO'
}

/** An enumeration. */
export enum ProjectStatusEnum {
  Blank = 'BLANK',
  Unpublished = 'UNPUBLISHED'
}

/** Common error-object class. */
export type Error = ErrorInterface & {
  __typename?: 'Error';
  /** Код ошибки, соответствующий человекочитаемому сообщению об ошибке */
  code: ErrorCodesEnum;
  /** Сообщение об ошибке. Отображается в случае отсутствия соответствующего коду человекочитаемого сообщения на клиенте */
  message: Scalars['String'];
  details?: Maybe<Scalars['String']>;
  payload?: Maybe<Scalars['DictType']>;
};

/** Интерфейс ошибок, отображаемых пользователю. */
export type ErrorInterface = {
  /** Код ошибки, соответствующий человекочитаемому сообщению об ошибке */
  code: ErrorCodesEnum;
  /** Сообщение об ошибке. Отображается в случае отсутствия соответствующего коду человекочитаемого сообщения на клиенте */
  message: Scalars['String'];
  details?: Maybe<Scalars['String']>;
  payload?: Maybe<Scalars['DictType']>;
};

/** Error codes list. */
export enum ErrorCodesEnum {
  /** Проект не найден */
  ProjectNotFound = 'PROJECT_NOT_FOUND',
  /** Ошибка при обновлении проекта */
  ProjectUpdateError = 'PROJECT_UPDATE_ERROR',
  /** Объект справочника не найден */
  ReferenceItemNotFound = 'REFERENCE_ITEM_NOT_FOUND',
  /** Ошибка */
  Error = 'ERROR',
  /** Некорректная версия проекта */
  IncorrectProjectVersion = 'INCORRECT_PROJECT_VERSION',
  /** Расхождение версий проекта */
  ProjectVersionDiffError = 'PROJECT_VERSION_DIFF_ERROR',
  /** Проект с таким именем уже существует */
  ProjectNameAlreadyExists = 'PROJECT_NAME_ALREADY_EXISTS',
  /** Пользователь не обладает правами для совершения операции */
  NoRights = 'NO_RIGHTS',
  /** Объект не найден */
  ObjectNotFound = 'OBJECT_NOT_FOUND',
  /** Отсутствует роль */
  EmptyAttendeeRole = 'EMPTY_ATTENDEE_ROLE',
  /** Удаляемый участник не найден в проекте  */
  NoAttendeeToRemove = 'NO_ATTENDEE_TO_REMOVE',
  /** Некорректный формат UUID */
  IncorrectUuid = 'INCORRECT_UUID',
  /** Участник проекта не найден */
  ProjectAttendeeNotFound = 'PROJECT_ATTENDEE_NOT_FOUND',
  /** Участник проекта уже обладет данной ролью */
  ProjectAttendeeAlreadyHasRole = 'PROJECT_ATTENDEE_ALREADY_HAS_ROLE',
  /** Рольу участника проекта не найдена */
  ProjectAttendeeUserRoleNotFound = 'PROJECT_ATTENDEE_USER_ROLE_NOT_FOUND',
  /** Невозможно добавить участника с дублирующимися ролями. */
  ProjectAttendeeUserWithDuplicateRoles = 'PROJECT_ATTENDEE_USER_WITH_DUPLICATE_ROLES',
  /** Невозможно сохранить проект - не найден менеджер проекта */
  ProjectManagerNotFound = 'PROJECT_MANAGER_NOT_FOUND',
  /** Проект нельзя возвращать в статус заготовки. */
  CannotBringBlankBack = 'CANNOT_BRING_BLANK_BACK',
  /** Неверный номер страницы */
  InvalidPageNumber = 'INVALID_PAGE_NUMBER',
  /** Ошибка валидации */
  Validation = 'VALIDATION'
}


export type ValidationError = ErrorInterface & {
  __typename?: 'ValidationError';
  /** Код ошибки, соответствующий человекочитаемому сообщению об ошибке */
  code: ErrorCodesEnum;
  /** Сообщение об ошибке. Отображается в случае отсутствия соответствующего коду человекочитаемого сообщения на клиенте */
  message: Scalars['String'];
  details?: Maybe<Scalars['String']>;
  payload?: Maybe<Scalars['DictType']>;
  /** Массив ошибок валидации для отправленных полей мутации */
  items?: Maybe<Array<Maybe<ValidationErrorItemType>>>;
};

export type ValidationErrorItemType = {
  __typename?: 'ValidationErrorItemType';
  path?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Код ошибки, соответствующий человекочитаемому сообщению об ошибке */
  code: ValidationErrorCode;
  /** Сообщение об ошибке валидации. Отображается в случае отсутствия соответствующего коду человекочитаемого сообщения на клиенте */
  message: Scalars['String'];
};

/** Validation error codes list. */
export enum ValidationErrorCode {
  /** NUMBER_TOO_LARGE */
  NumberTooLarge = 'NUMBER_TOO_LARGE',
  /** NUMBER_TOO_LOW */
  NumberTooLow = 'NUMBER_TOO_LOW',
  /** NUMBER_IS_NEGATIVE */
  NumberIsNegative = 'NUMBER_IS_NEGATIVE',
  /** STRING_TOO_LONG */
  StringTooLong = 'STRING_TOO_LONG',
  /** STRING_TOO_SHORT */
  StringTooShort = 'STRING_TOO_SHORT',
  /** STRING_DOES_NOT_MATCH_PATTERN */
  StringDoesNotMatchPattern = 'STRING_DOES_NOT_MATCH_PATTERN',
  /** ARRAY_IS_EMPTY */
  ArrayIsEmpty = 'ARRAY_IS_EMPTY',
  /** ARRAY_TOO_SHORT */
  ArrayTooShort = 'ARRAY_TOO_SHORT',
  /** ARRAY_TOO_LONG */
  ArrayTooLong = 'ARRAY_TOO_LONG',
  /** OBJECT_KEY_NOT_FOUND */
  ObjectKeyNotFound = 'OBJECT_KEY_NOT_FOUND',
  /** VALUE_IS_EMPTY */
  ValueIsEmpty = 'VALUE_IS_EMPTY',
  /** VALUE_HAS_WRONG_TYPE */
  ValueHasWrongType = 'VALUE_HAS_WRONG_TYPE',
  /** NOT_UNIQUE */
  NotUnique = 'NOT_UNIQUE'
}

export type ProjectListOrError = ProjectList | Error;

export type ProjectList = {
  __typename?: 'ProjectList';
  projectList?: Maybe<Array<Maybe<Project>>>;
  itemsTotal?: Maybe<Scalars['Int']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createProjectLibrary?: Maybe<CreateProjectLibrary>;
  deleteProjectLibrary?: Maybe<DeleteProjectLibrary>;
  updateProjectLibrary?: Maybe<UpdateProjectLibrary>;
  createProjectLibraryCategories?: Maybe<CreateProjectLibraryCategories>;
  deleteProjectLibraryCategories?: Maybe<DeleteProjectLibraryCategories>;
  updateProjectLibraryCategories?: Maybe<UpdateProjectLibraryCategories>;
  createComponent?: Maybe<CreateComponent>;
  deleteComponent?: Maybe<DeleteComponent>;
  updateComponent?: Maybe<UpdateComponent>;
  createComponentCategories?: Maybe<CreateComponentCategories>;
  deleteComponentCategories?: Maybe<DeleteComponentCategories>;
  updateComponentCategories?: Maybe<UpdateComponentCategories>;
  createAssembly?: Maybe<CreateAssembly>;
  deleteAssembly?: Maybe<DeleteAssembly>;
  updateAssembly?: Maybe<UpdateAssembly>;
  createAssemblyCategories?: Maybe<CreateAssemblyCategories>;
  deleteAssemblyCategories?: Maybe<DeleteAssemblyCategories>;
  updateAssemblyCategories?: Maybe<UpdateAssemblyCategories>;
  createActivity?: Maybe<CreateActivity>;
  deleteActivity?: Maybe<DeleteActivity>;
  updateActivity?: Maybe<UpdateActivity>;
  createActivityCategories?: Maybe<CreateActivityCategories>;
  deleteActivityCategories?: Maybe<DeleteActivityCategories>;
  updateActivityCategories?: Maybe<UpdateActivityCategories>;
  createDomainTemplate?: Maybe<CreateDomainTemplate>;
  deleteDomainTemplate?: Maybe<DeleteDomainTemplate>;
  updateDomainTemplate?: Maybe<UpdateDomainTemplate>;
  createDomainTemplateCategories?: Maybe<CreateDomainTemplateCategories>;
  deleteDomainTemplateCategories?: Maybe<DeleteDomainTemplateCategories>;
  updateDomainTemplateCategories?: Maybe<UpdateDomainTemplateCategories>;
  createUser?: Maybe<CreateUser>;
  deleteUser?: Maybe<DeleteUser>;
  updateUser?: Maybe<UpdateUser>;
  createProjectRole?: Maybe<CreateProjectRole>;
  deleteProjectRole?: Maybe<DeleteProjectRole>;
  updateProjectRole?: Maybe<UpdateProjectRole>;
  createAttachmentType?: Maybe<CreateAttachmentType>;
  deleteAttachmentType?: Maybe<DeleteAttachmentType>;
  updateAttachmentType?: Maybe<UpdateAttachmentType>;
  createUserGroup?: Maybe<CreateUserGroup>;
  deleteUserGroup?: Maybe<DeleteUserGroup>;
  updateUserGroup?: Maybe<UpdateUserGroup>;
  createOrganization?: Maybe<CreateOrganization>;
  deleteOrganization?: Maybe<DeleteOrganization>;
  updateOrganization?: Maybe<UpdateOrganization>;
  createOrganizationUnit?: Maybe<CreateOrganizationUnit>;
  deleteOrganizationUnit?: Maybe<DeleteOrganizationUnit>;
  updateOrganizationUnit?: Maybe<UpdateOrganizationUnit>;
  createCountry?: Maybe<CreateCountry>;
  deleteCountry?: Maybe<DeleteCountry>;
  updateCountry?: Maybe<UpdateCountry>;
  createRegion?: Maybe<CreateRegion>;
  deleteRegion?: Maybe<DeleteRegion>;
  updateRegion?: Maybe<UpdateRegion>;
  createAttachment?: Maybe<CreateAttachment>;
  deleteAttachment?: Maybe<DeleteAttachment>;
  updateAttachment?: Maybe<UpdateAttachment>;
  createJtiBlackListEntry?: Maybe<CreateJtiBlackListEntry>;
  deleteJtiBlackListEntry?: Maybe<DeleteJtiBlackListEntry>;
  updateJtiBlackListEntry?: Maybe<UpdateJtiBlackListEntry>;
  createDomainEntity?: Maybe<CreateDomainEntity>;
  deleteDomainEntity?: Maybe<DeleteDomainEntity>;
  updateDomainEntity?: Maybe<UpdateDomainEntity>;
  createProject?: Maybe<CreateProject>;
  deleteProject?: Maybe<DeleteProject>;
  updateProject?: Maybe<UpdateProject>;
  addAttendees?: Maybe<AddAttendees>;
  removeAttendees?: Maybe<RemoveAttendees>;
  addAttendeeRole?: Maybe<AttendeeTypeOrError>;
  removeAttendeeRole?: Maybe<AttendeeTypeOrError>;
};


export type MutationCreateProjectLibraryArgs = {
  category?: Maybe<Scalars['UUID']>;
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};


export type MutationDeleteProjectLibraryArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateProjectLibraryArgs = {
  category?: Maybe<Scalars['UUID']>;
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  vid: Scalars['UUID'];
};


export type MutationCreateProjectLibraryCategoriesArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<Scalars['UUID']>;
};


export type MutationDeleteProjectLibraryCategoriesArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateProjectLibraryCategoriesArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<Scalars['UUID']>;
  vid: Scalars['UUID'];
};


export type MutationCreateComponentArgs = {
  category?: Maybe<Scalars['UUID']>;
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};


export type MutationDeleteComponentArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateComponentArgs = {
  category?: Maybe<Scalars['UUID']>;
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  vid: Scalars['UUID'];
};


export type MutationCreateComponentCategoriesArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<Scalars['UUID']>;
};


export type MutationDeleteComponentCategoriesArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateComponentCategoriesArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<Scalars['UUID']>;
  vid: Scalars['UUID'];
};


export type MutationCreateAssemblyArgs = {
  category?: Maybe<Scalars['UUID']>;
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};


export type MutationDeleteAssemblyArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateAssemblyArgs = {
  category?: Maybe<Scalars['UUID']>;
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  vid: Scalars['UUID'];
};


export type MutationCreateAssemblyCategoriesArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<Scalars['UUID']>;
};


export type MutationDeleteAssemblyCategoriesArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateAssemblyCategoriesArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<Scalars['UUID']>;
  vid: Scalars['UUID'];
};


export type MutationCreateActivityArgs = {
  category?: Maybe<Scalars['UUID']>;
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};


export type MutationDeleteActivityArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateActivityArgs = {
  category?: Maybe<Scalars['UUID']>;
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  vid: Scalars['UUID'];
};


export type MutationCreateActivityCategoriesArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<Scalars['UUID']>;
};


export type MutationDeleteActivityCategoriesArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateActivityCategoriesArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<Scalars['UUID']>;
  vid: Scalars['UUID'];
};


export type MutationCreateDomainTemplateArgs = {
  attributes?: Maybe<Array<Maybe<PropertyMetaInputType>>>;
  category?: Maybe<Scalars['UUID']>;
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  entity?: Maybe<Scalars['UUID']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};


export type MutationDeleteDomainTemplateArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateDomainTemplateArgs = {
  attributes?: Maybe<Array<Maybe<PropertyMetaInputType>>>;
  category?: Maybe<Scalars['UUID']>;
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  entity?: Maybe<Scalars['UUID']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  vid: Scalars['UUID'];
};


export type MutationCreateDomainTemplateCategoriesArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<Scalars['UUID']>;
};


export type MutationDeleteDomainTemplateCategoriesArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateDomainTemplateCategoriesArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<Scalars['UUID']>;
  vid: Scalars['UUID'];
};


export type MutationCreateUserArgs = {
  adId?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  favoriteProjects?: Maybe<Array<Maybe<Scalars['ID']>>>;
  firstName?: Maybe<Scalars['String']>;
  groups?: Maybe<Array<Maybe<Scalars['UUID']>>>;
  lastName?: Maybe<Scalars['String']>;
  login?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  organizationUnits?: Maybe<Array<Maybe<Scalars['UUID']>>>;
  patronym?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
};


export type MutationDeleteUserArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateUserArgs = {
  adId?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  favoriteProjects?: Maybe<Array<Maybe<Scalars['ID']>>>;
  firstName?: Maybe<Scalars['String']>;
  groups?: Maybe<Array<Maybe<Scalars['UUID']>>>;
  lastName?: Maybe<Scalars['String']>;
  login?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  organizationUnits?: Maybe<Array<Maybe<Scalars['UUID']>>>;
  patronym?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  vid: Scalars['UUID'];
};


export type MutationCreateProjectRoleArgs = {
  code?: Maybe<Scalars['String']>;
  defaultAttachmentType?: Maybe<Scalars['UUID']>;
  name?: Maybe<Scalars['String']>;
};


export type MutationDeleteProjectRoleArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateProjectRoleArgs = {
  code?: Maybe<Scalars['String']>;
  defaultAttachmentType?: Maybe<Scalars['UUID']>;
  name?: Maybe<Scalars['String']>;
  vid: Scalars['UUID'];
};


export type MutationCreateAttachmentTypeArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};


export type MutationDeleteAttachmentTypeArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateAttachmentTypeArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  vid: Scalars['UUID'];
};


export type MutationCreateUserGroupArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  project?: Maybe<Scalars['ID']>;
};


export type MutationDeleteUserGroupArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateUserGroupArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  project?: Maybe<Scalars['ID']>;
  vid: Scalars['UUID'];
};


export type MutationCreateOrganizationArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};


export type MutationDeleteOrganizationArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateOrganizationArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  vid: Scalars['UUID'];
};


export type MutationCreateOrganizationUnitArgs = {
  adId?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  organization?: Maybe<Scalars['UUID']>;
  parentOu?: Maybe<Scalars['UUID']>;
};


export type MutationDeleteOrganizationUnitArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateOrganizationUnitArgs = {
  adId?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  organization?: Maybe<Scalars['UUID']>;
  parentOu?: Maybe<Scalars['UUID']>;
  vid: Scalars['UUID'];
};


export type MutationCreateCountryArgs = {
  code?: Maybe<Scalars['String']>;
  coordinateSystems?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
};


export type MutationDeleteCountryArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateCountryArgs = {
  code?: Maybe<Scalars['String']>;
  coordinateSystems?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  vid: Scalars['UUID'];
};


export type MutationCreateRegionArgs = {
  code?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['UUID']>;
  fullName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};


export type MutationDeleteRegionArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateRegionArgs = {
  code?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['UUID']>;
  fullName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  vid: Scalars['UUID'];
};


export type MutationCreateAttachmentArgs = {
  category?: Maybe<Scalars['UUID']>;
  code?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  contentType?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  projectId?: Maybe<Scalars['ID']>;
  status?: Maybe<Scalars['Int']>;
};


export type MutationDeleteAttachmentArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateAttachmentArgs = {
  category?: Maybe<Scalars['UUID']>;
  code?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  contentType?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  projectId?: Maybe<Scalars['ID']>;
  status?: Maybe<Scalars['Int']>;
  vid: Scalars['UUID'];
};


export type MutationCreateJtiBlackListEntryArgs = {
  code?: Maybe<Scalars['String']>;
  exp?: Maybe<Scalars['Int']>;
  jti?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};


export type MutationDeleteJtiBlackListEntryArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateJtiBlackListEntryArgs = {
  code?: Maybe<Scalars['String']>;
  exp?: Maybe<Scalars['Int']>;
  jti?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  vid: Scalars['UUID'];
};


export type MutationCreateDomainEntityArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};


export type MutationDeleteDomainEntityArgs = {
  vid: Scalars['UUID'];
};


export type MutationUpdateDomainEntityArgs = {
  code?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  vid: Scalars['UUID'];
};


export type MutationCreateProjectArgs = {
  data?: Maybe<ProjectInputType>;
};


export type MutationDeleteProjectArgs = {
  vid?: Maybe<Scalars['UUID']>;
};


export type MutationUpdateProjectArgs = {
  data?: Maybe<ProjectUpdateType>;
  vid?: Maybe<Scalars['UUID']>;
};


export type MutationAddAttendeesArgs = {
  attendees: Array<Maybe<AttendeeInputType>>;
  projectId: Scalars['UUID'];
  version: Scalars['Int'];
};


export type MutationRemoveAttendeesArgs = {
  attendees: Array<Maybe<Scalars['UUID']>>;
  projectId: Scalars['UUID'];
  version: Scalars['Int'];
};


export type MutationAddAttendeeRoleArgs = {
  projectId: Scalars['UUID'];
  role: Scalars['UUID'];
  user: Scalars['UUID'];
  version: Scalars['Int'];
};


export type MutationRemoveAttendeeRoleArgs = {
  projectId: Scalars['UUID'];
  role: Scalars['UUID'];
  user: Scalars['UUID'];
  version: Scalars['Int'];
};

export type CreateProjectLibrary = {
  __typename?: 'CreateProjectLibrary';
  result?: Maybe<ProjectLibrary>;
};

export type DeleteProjectLibrary = {
  __typename?: 'DeleteProjectLibrary';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateProjectLibrary = {
  __typename?: 'UpdateProjectLibrary';
  result?: Maybe<ProjectLibrary>;
};

export type CreateProjectLibraryCategories = {
  __typename?: 'CreateProjectLibraryCategories';
  result?: Maybe<ProjectLibraryCategory>;
};

export type DeleteProjectLibraryCategories = {
  __typename?: 'DeleteProjectLibraryCategories';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateProjectLibraryCategories = {
  __typename?: 'UpdateProjectLibraryCategories';
  result?: Maybe<ProjectLibrary>;
};

export type CreateComponent = {
  __typename?: 'CreateComponent';
  result?: Maybe<Component>;
};

export type DeleteComponent = {
  __typename?: 'DeleteComponent';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateComponent = {
  __typename?: 'UpdateComponent';
  result?: Maybe<Component>;
};

export type CreateComponentCategories = {
  __typename?: 'CreateComponentCategories';
  result?: Maybe<ComponentLibraryCategory>;
};

export type DeleteComponentCategories = {
  __typename?: 'DeleteComponentCategories';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateComponentCategories = {
  __typename?: 'UpdateComponentCategories';
  result?: Maybe<Component>;
};

export type CreateAssembly = {
  __typename?: 'CreateAssembly';
  result?: Maybe<Assembly>;
};

export type DeleteAssembly = {
  __typename?: 'DeleteAssembly';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateAssembly = {
  __typename?: 'UpdateAssembly';
  result?: Maybe<Assembly>;
};

export type CreateAssemblyCategories = {
  __typename?: 'CreateAssemblyCategories';
  result?: Maybe<AssemblyLibraryCategory>;
};

export type DeleteAssemblyCategories = {
  __typename?: 'DeleteAssemblyCategories';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateAssemblyCategories = {
  __typename?: 'UpdateAssemblyCategories';
  result?: Maybe<Assembly>;
};

export type CreateActivity = {
  __typename?: 'CreateActivity';
  result?: Maybe<Activity>;
};

export type DeleteActivity = {
  __typename?: 'DeleteActivity';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateActivity = {
  __typename?: 'UpdateActivity';
  result?: Maybe<Activity>;
};

export type CreateActivityCategories = {
  __typename?: 'CreateActivityCategories';
  result?: Maybe<ActivityLibraryCategory>;
};

export type DeleteActivityCategories = {
  __typename?: 'DeleteActivityCategories';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateActivityCategories = {
  __typename?: 'UpdateActivityCategories';
  result?: Maybe<Activity>;
};

export type CreateDomainTemplate = {
  __typename?: 'CreateDomainTemplate';
  result?: Maybe<DomainTemplate>;
};

export type PropertyMetaInputType = {
  title?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  entity?: Maybe<Scalars['UUID']>;
  attrType?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['String']>;
  validationRules?: Maybe<ValidationRulesInputType>;
  description?: Maybe<Scalars['String']>;
  required?: Maybe<Scalars['Boolean']>;
};

export type ValidationRulesInputType = {
  rules?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DeleteDomainTemplate = {
  __typename?: 'DeleteDomainTemplate';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateDomainTemplate = {
  __typename?: 'UpdateDomainTemplate';
  result?: Maybe<DomainTemplate>;
};

export type CreateDomainTemplateCategories = {
  __typename?: 'CreateDomainTemplateCategories';
  result?: Maybe<DomainTemplateLibraryCategory>;
};

export type DeleteDomainTemplateCategories = {
  __typename?: 'DeleteDomainTemplateCategories';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateDomainTemplateCategories = {
  __typename?: 'UpdateDomainTemplateCategories';
  result?: Maybe<DomainTemplate>;
};

export type CreateUser = {
  __typename?: 'CreateUser';
  result?: Maybe<User>;
};

export type DeleteUser = {
  __typename?: 'DeleteUser';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateUser = {
  __typename?: 'UpdateUser';
  result?: Maybe<User>;
};

export type CreateProjectRole = {
  __typename?: 'CreateProjectRole';
  result?: Maybe<ProjectRole>;
};

export type DeleteProjectRole = {
  __typename?: 'DeleteProjectRole';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateProjectRole = {
  __typename?: 'UpdateProjectRole';
  result?: Maybe<ProjectRole>;
};

export type CreateAttachmentType = {
  __typename?: 'CreateAttachmentType';
  result?: Maybe<AttachmentType>;
};

export type DeleteAttachmentType = {
  __typename?: 'DeleteAttachmentType';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateAttachmentType = {
  __typename?: 'UpdateAttachmentType';
  result?: Maybe<AttachmentType>;
};

export type CreateUserGroup = {
  __typename?: 'CreateUserGroup';
  result?: Maybe<UserGroup>;
};

export type DeleteUserGroup = {
  __typename?: 'DeleteUserGroup';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateUserGroup = {
  __typename?: 'UpdateUserGroup';
  result?: Maybe<UserGroup>;
};

export type CreateOrganization = {
  __typename?: 'CreateOrganization';
  result?: Maybe<Organization>;
};

export type DeleteOrganization = {
  __typename?: 'DeleteOrganization';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateOrganization = {
  __typename?: 'UpdateOrganization';
  result?: Maybe<Organization>;
};

export type CreateOrganizationUnit = {
  __typename?: 'CreateOrganizationUnit';
  result?: Maybe<OrganizationUnit>;
};

export type DeleteOrganizationUnit = {
  __typename?: 'DeleteOrganizationUnit';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateOrganizationUnit = {
  __typename?: 'UpdateOrganizationUnit';
  result?: Maybe<OrganizationUnit>;
};

export type CreateCountry = {
  __typename?: 'CreateCountry';
  result?: Maybe<Country>;
};

export type DeleteCountry = {
  __typename?: 'DeleteCountry';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateCountry = {
  __typename?: 'UpdateCountry';
  result?: Maybe<Country>;
};

export type CreateRegion = {
  __typename?: 'CreateRegion';
  result?: Maybe<Region>;
};

export type DeleteRegion = {
  __typename?: 'DeleteRegion';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateRegion = {
  __typename?: 'UpdateRegion';
  result?: Maybe<Region>;
};

export type CreateAttachment = {
  __typename?: 'CreateAttachment';
  result?: Maybe<Attachment>;
};

export type DeleteAttachment = {
  __typename?: 'DeleteAttachment';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateAttachment = {
  __typename?: 'UpdateAttachment';
  result?: Maybe<Attachment>;
};

export type CreateJtiBlackListEntry = {
  __typename?: 'CreateJtiBlackListEntry';
  result?: Maybe<JtiBlackListEntry>;
};

export type DeleteJtiBlackListEntry = {
  __typename?: 'DeleteJtiBlackListEntry';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateJtiBlackListEntry = {
  __typename?: 'UpdateJtiBlackListEntry';
  result?: Maybe<JtiBlackListEntry>;
};

export type CreateDomainEntity = {
  __typename?: 'CreateDomainEntity';
  result?: Maybe<DomainEntity>;
};

export type DeleteDomainEntity = {
  __typename?: 'DeleteDomainEntity';
  result?: Maybe<Scalars['Boolean']>;
};

export type UpdateDomainEntity = {
  __typename?: 'UpdateDomainEntity';
  result?: Maybe<DomainEntity>;
};

export type CreateProject = {
  __typename?: 'CreateProject';
  result?: Maybe<ProjectOrError>;
};

export type ProjectInputType = {
  name?: Maybe<Scalars['String']>;
  region?: Maybe<Scalars['UUID']>;
  type?: Maybe<ProjectTypeEnum>;
  coordinateSystem?: Maybe<Scalars['String']>;
  coordinates?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  resourceId?: Maybe<Scalars['String']>;
  yearStart?: Maybe<Scalars['Int']>;
  yearEnd?: Maybe<Scalars['Int']>;
};

export type DeleteProject = {
  __typename?: 'DeleteProject';
  result?: Maybe<UuidOrError>;
};

export type UuidOrError = Result | Error;

export type Result = {
  __typename?: 'Result';
  vid?: Maybe<Scalars['UUID']>;
};

export type UpdateProject = {
  __typename?: 'UpdateProject';
  result?: Maybe<ProjectDiffOrError>;
};

export type ProjectDiffOrError = Project | UpdateProjectDiff | Error | ValidationError;

/** Contains remote and local versions of  project if versions are not equal. */
export type UpdateProjectDiff = {
  __typename?: 'UpdateProjectDiff';
  remoteProject?: Maybe<Project>;
  localProject?: Maybe<Project>;
  message?: Maybe<Scalars['String']>;
};

export type ProjectUpdateType = {
  name?: Maybe<Scalars['String']>;
  region?: Maybe<Scalars['UUID']>;
  coordinateSystem?: Maybe<Scalars['String']>;
  coordinates?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  status?: Maybe<ProjectStatusEnum>;
  isFavorite?: Maybe<Scalars['Boolean']>;
  resourceId?: Maybe<Scalars['String']>;
  yearStart?: Maybe<Scalars['Int']>;
  yearEnd?: Maybe<Scalars['Int']>;
  /** Version of the original project. */
  version: Scalars['Int'];
};

export type AddAttendees = {
  __typename?: 'AddAttendees';
  result?: Maybe<AttendeeListOrError>;
};

export type AttendeeListOrError = AttendeeList | UpdateProjectDiff | Error | DuplicateRoleError;

export type AttendeeList = {
  __typename?: 'AttendeeList';
  attendeeList?: Maybe<Array<Maybe<Attendee>>>;
};

export type DuplicateRoleError = ErrorInterface & {
  __typename?: 'DuplicateRoleError';
  /** Код ошибки, соответствующий человекочитаемому сообщению об ошибке */
  code: ErrorCodesEnum;
  /** Сообщение об ошибке. Отображается в случае отсутствия соответствующего коду человекочитаемого сообщения на клиенте */
  message: Scalars['String'];
  details?: Maybe<Scalars['String']>;
  payload?: Maybe<Scalars['DictType']>;
  roles?: Maybe<Array<Maybe<Scalars['UUID']>>>;
};

export type AttendeeInputType = {
  user: Scalars['UUID'];
  roles: Array<Maybe<Scalars['UUID']>>;
};

export type RemoveAttendees = {
  __typename?: 'RemoveAttendees';
  result?: Maybe<AttendeeListOrError>;
};

export type AttendeeTypeOrError = Attendee | UpdateProjectDiff | Error;

export const namedOperations = {
  Query: {
    GetProjectName: 'GetProjectName'
  }
}