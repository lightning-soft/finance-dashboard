const sortTransform = {
    ascend: 'ASC',
    descend: 'DESC',
};

export function onQueryParamsChange(params) {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find(item => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;

    this.setQueryParams({
        page: pageIndex || 1,
        take: pageSize || 10,
        sort: sort.filter(i => i.value).map(({ key, value }) => `${key},${sortTransform[value]}`),
    });
};