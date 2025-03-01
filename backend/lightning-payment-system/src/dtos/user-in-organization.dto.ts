import { OrganizationStatus } from "src/enums/organization-status";

export interface UserInOrganizationDto {
    id: string;
    name: string;
    email: string;
    role: string;
    isSelf: boolean;
    status: OrganizationStatus
}
