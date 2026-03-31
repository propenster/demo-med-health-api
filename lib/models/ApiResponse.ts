export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
};

export interface ApiResponse<T>  {
    pagination: Pagination | null;
    metadata: {
        timestamp: string;
        version: string;
        requestId: string;
    };
    data?: T | null;
};