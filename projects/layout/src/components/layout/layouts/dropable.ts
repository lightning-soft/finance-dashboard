export interface IDropable {
    canDragAndDrop: boolean;

    createDragSource(element, component: string);
}
