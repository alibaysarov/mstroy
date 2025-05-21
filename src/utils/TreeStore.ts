import type {Row} from "../types";


class TreeStore {
    private list: Row[] = [];
    private map: Map<string | number, Row> = new Map();

    constructor(items: Omit<Row, 'expanded' | 'level' | 'type'>[] = []) {
        items.forEach(item => {
            if (this.map.has(item.id)) {
                throw new Error(`Duplicate id found: ${item.id}`);
            }

            const row: Row = {
                ...item,
                expanded: false,
                level: this.getItemLevel(item),
                type: ""
            };

            this.map.set(row.id, row);
            this.list.push(row);
        });
    }

    private getItemLevel(item: { id: string | number; parent: string | number | null }): number {
        let level = 0;
        let currentParent = item.parent;

        while (currentParent !== null && this.map.has(currentParent)) {
            level++;
            const parent = this.map.get(currentParent);
            currentParent = parent?.parent ?? null;
        }

        return level;
    }

    getAll(): Row[] {
        return this.list;
    }

    getItem(id: string | number): Row | null {
        return this.map.get(id) || null;
    }

    getChildren(id: string | number | null): Row[] {
        return this.list.filter(item => item.parent === id);
    }

    toRowData(): Row[] {
        return this.getChildren(null)
        //     .map(el => ({
        //     ...el,
        //     expanded: false,
        //     level: 0,
        //     type: ""
        // }));
    }

    getAllChildren(id: string | number): Row[] {
        const result: Row[] = [];

        const collect = (parentId: string | number): void => {
            this.getChildren(parentId).forEach(child => {
                result.push(child);
                collect(child.id);
            });
        };

        collect(id);

        return result;
    }

    getParent(id: string | number): Row | null {
        const item = this.getItem(id);
        if (!item || item.parent === null) return null;

        return this.getItem(item.parent);
    }

    getAllParents(id: string | number): Row[] {
        const path: Row[] = [];
        let current = this.getParent(id);

        while (current) {
            path.push(current);
            current = this.getParent(current.id);
        }

        return path;
    }

    addItem(obj: Omit<Row, 'expanded' | 'level' | 'type'>): Row {
        const { id, parent } = obj;

        if (this.map.has(id)) {
            throw new Error(`Element with id "${id}" already exists`);
        }

        if (parent !== null && !this.map.has(parent)) {
            throw new Error(`Parent element with id "${parent}" not found`);
        }

        const row: Row = {
            ...obj,
            expanded: false,
            level: this.getItemLevel(obj),
            type: ""
        };

        this.map.set(id, row);
        this.list.push(row);
        return row;
    }

    updateItem(obj: Omit<Row, 'expanded' | 'level' | 'type'>): void {
        const { id, parent } = obj;

        if (!this.map.has(id)) {
            throw new Error(`Element with id "${id}" not found`);
        }

        if (parent !== null && !this.map.has(parent)) {
            throw new Error(`Parent element with id "${parent}" not found`);
        }

        const old = this.map.get(id)!;

        const updated: Row = {
            ...obj,
            expanded: old.expanded,
            level: this.getItemLevel(obj),
            type: old.type
        };

        this.map.set(id, updated);
        this.list = this.list.map(item => item.id === id ? updated : item);
    }

    removeItem(id: string | number): void {
        const target = this.getItem(id);
        if (!target) {
            throw new Error(`Element with id "${id}" not found`);
        }

        const idsToRemove: Set<string | number> = new Set([id]);
        const queue: (string | number)[] = [id];

        while (queue.length > 0) {
            const parentId = queue.shift()!;
            this.getChildren(parentId).forEach(child => {
                idsToRemove.add(child.id);
                queue.push(child.id);
            });
        }

        this.list = this.list.filter(item => !idsToRemove.has(item.id));
        idsToRemove.forEach(id => this.map.delete(id));
    }
}

export default TreeStore;
