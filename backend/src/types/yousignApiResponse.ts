//Type basé sur le site https://developers.yousign.com/

export interface YousignApiResponse {
    yousignId: string;
    status: string;
    type: string;
    templateId: string;
    customerId?: string;
    purchaseOfferId?: string;
    dossierId?: string;
    investorName?: string;
}

export interface SignerDocument {
    id: string; // UUID
    title: string; // entre 1 et 255 caractères
    filename: string | null;
}

export interface SignerDocumentsResponse {
    meta: {
        next_cursor: string | null;
    };
    data: SignerDocument[];
}

export interface SignatureRequestMetadata {
    type: string;
    cfp_app_dossier_id?: string;
    cfp_app_po_id?: string;
    mandat_reference: string;
    version: number;
}

export interface SignReqMetadataWithDossierId
    extends Omit<SignatureRequestMetadata, 'cfp_app_dossier_id'> {
    cfp_app_dossier_id: string;
}
