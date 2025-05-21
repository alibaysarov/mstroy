export interface Row {
    id: string | number;
    parent: string | number | null;
    label: string;
    expanded: boolean;
    level: number;
    type: string;
}
export type ItemDto =  Omit<Row, 'expanded' | 'level' | 'type'>