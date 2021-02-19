export const resolveTypes = {
  UuidOrError: {
    __resolveType(): string {
      return 'UUID';
    },
  },
  AttendeeTypeOrError: {
    __resolveType(): string {
      return 'Attendee';
    },
  },
  AttendeeListOrError: {
    __resolveType(): string {
      return 'AttendeeList';
    },
  },
  ErrorInterface: {
    __resolveType(): string {
      return 'Error';
    },
  },
  ProjectOrError: {
    __resolveType(): string {
      return 'Project';
    },
  },
  ProjectDiffOrError: {
    __resolveType(): string {
      return 'Project';
    },
  },
  ProjectListOrError: {
    __resolveType(): string {
      return 'ProjectList';
    },
  },
};
