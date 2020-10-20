export interface IPaginationParams {
    skip: number;
    take: number;
}

export interface IPaginationResponse<T = any> {
    data: T[];
    total: number;
}
