// Pipedrive API Types

// Generic response types
export interface PipedrivePagination {
    start: number;
    limit: number;
    more_items_in_collection: boolean;
    next_start?: number;
}

export interface PipedriveResponse<T> {
    success: boolean;
    data: T;
    additional_data?: {
        pagination?: PipedrivePagination;
    };
}

export interface PipedriveSearchResult<T> {
    item: T;
    item_type: string;
    result_score: number;
}

// Person types
export interface PipedrivePerson {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    org_id?: number;
    owner_id?: number;
    visible_to?: number;
    add_time?: string;
    update_time?: string;
    last_activity_date?: string;
    next_activity_date?: string;
    created_at?: string;
    updated_at?: string;
    active_flag?: boolean;
    deleted?: boolean;
    status?: string;
    marketing_status?: string;
    phone_followed?: boolean;
    lost_flag?: boolean;
    won_flag?: boolean;
    first_char?: string;
    visible_to_3?: number;
    picture_id?: number;
    next_activity_id?: number;
    last_activity_id?: number;
    last_activity?: string;
    next_activity?: string;
    org_name?: string;
    owner_name?: string;
    cc_email?: string;
}

export interface PipedrivePersonCreate {
    name: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    org_id?: number;
    owner_id?: number;
    visible_to?: number;
    marketing_status?: string;
}

export interface PipedrivePersonUpdate {
    name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    org_id?: number;
    owner_id?: number;
    visible_to?: number;
    marketing_status?: string;
}

export interface PipedrivePersonsQuery {
    user_id?: number;
    filter_id?: number;
    first_char?: string;
    start?: number;
    limit?: number;
    sort?: string;
}

// Organization types
export interface PipedriveOrganization {
    id: number;
    name: string;
    address?: string;
    address_subpremise?: string;
    address_street_number?: string;
    address_route?: string;
    address_sublocality?: string;
    address_locality?: string;
    address_admin_area_level_1?: string;
    address_admin_area_level_2?: string;
    address_country?: string;
    address_postal_code?: string;
    address_formatted_address?: string;
    cc_email?: string;
    owner_id?: number;
    visible_to?: number;
    add_time?: string;
    update_time?: string;
    last_activity_date?: string;
    next_activity_date?: string;
    created_at?: string;
    updated_at?: string;
    active_flag?: boolean;
    deleted?: boolean;
    status?: string;
    picture_id?: number;
    next_activity_id?: number;
    last_activity_id?: number;
    last_activity?: string;
    next_activity?: string;
    owner_name?: string;
}

export interface PipedriveOrganizationCreate {
    name: string;
    address?: string;
    address_subpremise?: string;
    address_street_number?: string;
    address_route?: string;
    address_sublocality?: string;
    address_locality?: string;
    address_admin_area_level_1?: string;
    address_admin_area_level_2?: string;
    address_country?: string;
    address_postal_code?: string;
    address_formatted_address?: string;
    cc_email?: string;
    owner_id?: number;
    visible_to?: number;
    add_time?: string;
    update_time?: string;
    label_ids?: number[];
}

export interface PipedriveOrganizationsQuery {
    user_id?: number;
    filter_id?: number;
    first_char?: string;
    start?: number;
    limit?: number;
    sort?: string;
}

// Deal types
export interface PipedriveDeal {
    id: number;
    title: string;
    value?: number;
    currency?: string;
    user_id?: number;
    person_id?: number;
    org_id?: number;
    stage_id?: number;
    status?: string;
    lost_reason?: string;
    visible_to?: number;
    add_time?: string;
    update_time?: string;
    stage_change_time?: string;
    first_won_time?: string;
    won_time?: string;
    lost_time?: string;
    close_time?: string;
    lost_reason_id?: number;
    owner_name?: string;
    cc_email?: string;
    org_name?: string;
    person_name?: string;
    stage_name?: string;
}

export interface PipedriveDealCreate {
    title: string;
    value?: number;
    currency?: string;
    user_id?: number;
    person_id?: number;
    org_id?: number;
    stage_id?: number;
    status?: string;
    lost_reason?: string;
    visible_to?: number;
    owner_id?: number;
    pipeline_id?: number;
    is_deleted?: boolean;
    is_archived?: boolean;
    archive_time?: string;
    probability?: number;
    close_time?: string;
    won_time?: string;
    lost_time?: string;
    expected_close_date?: string;
    label_ids?: number[];
}

export interface PipedriveDealsQuery {
    user_id?: number;
    filter_id?: number;
    stage_id?: number;
    status?: string;
    start?: number;
    limit?: number;
    sort?: string;
    term?: string;
    fields?: string
}

export type PipedriveFieldValue = string | number | boolean | Date | null;
// Activity types
export interface PipedriveActivity {
    id: number;
    company_user_id?: number;
    user_id?: number;
    done?: boolean;
    type?: string;
    reference_type?: string;
    reference_id?: number;
    conference_meeting_client?: string;
    conference_meeting_url?: string;
    conference_meeting_id?: string;
    due_date?: string;
    due_time?: string;
    duration?: string;
    busy_flag?: boolean;
    add_time?: string;
    marked_as_done_time?: string;
    last_notification_time?: string;
    last_notification_user_id?: number;
    notification_language_id?: number;
    subject?: string;
    type_name?: string;
}

export interface PipedriveActivityParticipant {
    person_id: number;
    primary?: boolean;
}

export interface PipedriveActivityAttendee {
    user_id: number;
    email?: string;
    name?: string;
}

export interface PipedriveActivityCreate {
    subject: string;
    type: string;
    due_date?: string;
    due_time?: string;
    duration?: string;
    user_id?: number;
    deal_id?: number;
    person_id?: number;
    org_id?: number;
    note?: string;
    owner_id?: number;
    lead_id?: number;
    project_id?: number;
    busy?: boolean;
    done?: boolean;
    location?: string;
    participants?: PipedriveActivityParticipant[];
    attendees?: PipedriveActivityAttendee[];
    public_description?: string;
    priority?: number;
}

export interface PipedriveActivitiesQuery {
    user_id?: number;
    filter_id?: number;
    start?: number;
    limit?: number;
    sort?: string;
}

// Note types
export interface PipedriveNote {
    id: number;
    user_id?: number;
    deal_id?: number;
    person_id?: number;
    org_id?: number;
    content?: string;
    add_time?: string;
    update_time?: string;
    active_flag?: boolean;
    pinned_to_deal_flag?: boolean;
    pinned_to_person_flag?: boolean;
    pinned_to_organization_flag?: boolean;
}

export interface PipedriveNoteCreate {
    content: string;
    deal_id?: number;
    person_id?: number;
    org_id?: number;
}

// User types
export interface PipedriveUser {
    id: number;
    name: string;
    email: string;
    has_pic?: boolean;
    pic_hash?: string;
    active_flag?: boolean;
    value?: number;
}

export interface PipedriveUserCreate {
    name: string;
    email: string;
    active_flag?: boolean;
}

export interface PipedriveUserUpdate {
    name?: string;
    email?: string;
    active_flag?: boolean;
}

export interface PipedriveUsersQuery {
    start?: number;
    limit?: number;
}

// Lead types
export interface PipedriveLead {
    id: string;
    title: string;
    owner_id: number;
    creator_id: number;
    label_ids: string[];
    person_id?: number;
    organization_id?: number;
    source_name?: string;
    is_archived: boolean;
    was_seen: boolean;
    value?: number;
    currency?: string;
    add_time: string;
    update_time: string;
    visible_to: number;
    cc_email: string;
}

export interface PipedriveLeadCreate {
    title: string;
    owner_id: number;
    label_ids?: string[];
    person_id?: number;
    organization_id?: number;
    value?: number;
    currency?: string;
    visible_to?: number;
    expected_close_date?: string;
    was_seen?: boolean;
    origin_id?: string;
    channel?: string;
    channel_id?: string;
}

// Update d'un lead: mêmes champs que create mais tous optionnels
export type PipedriveLeadUpdate = Partial<PipedriveLeadCreate>;

export interface PipedriveLeadsQuery {
    start?: number;
    limit?: number;
    include_fields?: string;
}

// Query types
export interface PipedriveFiltersQuery {
    start?: number;
    limit?: number;
}

export interface PipedriveStagesQuery {
    pipeline_id?: number;
}

// Facebook Leadgen types
export interface FacebookLeadgenQuery {
    access_token?: string;
    fields?: string;
    limit?: number;
}
export interface PipedriveComment {
    id: number;
    content: string;
    user_id?: number;
    add_time?: string;
    update_time?: string;
    active_flag?: boolean;
}

// Follower types
export interface PipedriveFollower {
    user_id: number;
    id: number;
    add_time?: string;
    update_time?: string;
}

// Stage types
export interface PipedriveStageData {
    id: number;
    order_nr: number;
    name: string;
    active_flag?: boolean;
    deal_probability?: number;
    pipeline_id?: number;
    rotten_flag?: boolean;
    rotten_days?: number;
    add_time?: string;
    update_time?: string;
    pipeline_name?: string;
    pipeline_deal_probability?: boolean;
}

// Pipeline types
export interface PipedrivePipeline {
    id: number;
    name: string;
    url_title: string;
    order_nr: number;
    active?: boolean;
    deal_probability?: boolean;
    add_time?: string;
    update_time?: string;
    selected?: boolean;
}

// Product types
export interface PipedriveProduct {
    id: number;
    name: string;
    code?: string;
    unit?: string;
    tax?: number;
    active_flag?: boolean;
    selectable?: boolean;
    first_char?: string;
    visible_to?: number;
    owner_id?: number;
    files_count?: number;
    followers_count?: number;
    add_time?: string;
    update_time?: string;
    prices?: PipedriveProductPrice[];
}

export interface PipedriveProductPrice {
    id: number;
    product_id: number;
    price: number;
    currency: string;
    cost?: number;
    overhead_cost?: number;
}

// File types
export interface PipedriveFile {
    id: number;
    user_id?: number;
    deal_id?: number;
    person_id?: number;
    org_id?: number;
    product_id?: number;
    activity_id?: number;
    note_id?: number;
    lead_id?: number;
    mail_message_id?: number;
    mail_template_id?: number;
    log_entries_count?: number;
    name: string;
    file_name?: string;
    file_type?: string;
    file_size?: number;
    file_url?: string;
    active_flag?: boolean;
    inline_flag?: boolean;
    remote_location?: string;
    remote_id?: string;
    cid?: string;
    s3_bucket?: string;
    add_time?: string;
    update_time?: string;
}

// Filter types
export interface PipedriveFilter {
    id: number;
    name: string;
    active_flag?: boolean;
    type?: string;
    temporary_flag?: boolean;
    user_id?: number;
    add_time?: string;
    update_time?: string;
    visible_to?: number;
    custom_view_id?: number;
}
export enum PipedriveStage {
    // Pipeline 2 - Dossiers (Développement)
    CONTACT_EFFECTUE_DEV = 7,
    QUALIFICATION_DEV = 8,
    SIGNATURE_MANDAT_DEV = 9,
    MATCHING_OPPORTUNITE_DEV = 10,
    OPPORTUNITE_ACCEPTEE_DEV = 11,
    REDACTION_COMPROMIS_DEV = 12,
    SOUS_COMPROMIS_DEV = 13,
    FINANCEMENT_TROUVE_DEV = 14,

    // Stages spécifiques (Développement)
    SIGNATURE_COMPROMIS_DEV = 24,
    REDACTION_COMPROMIS_ALT_DEV = 26,
    OFFRE_PRET_OBTENUE_DEV = 27,

    // Pipeline 2 - Dossiers (Production)
    QUALIFICATION_PROD = 33,
    SIGNATURE_MANDAT_PROD = 34,
    OPPORTUNITE_ACCEPTEE_PROD = 35,

}