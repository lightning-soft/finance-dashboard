export interface IPaginationResponse<T = any> {
    data: T[];
    total: number;
}

export interface IPaginationParams<T = number> {
    skip: T;
    take: T;
}
