import { MigrationOptions } from '../types';
import { CreateView, DropView, AlterView, AlterViewColumn, RenameView, ViewOptions } from './viewsTypes';
export { CreateView, DropView, AlterView, AlterViewColumn, RenameView, ViewOptions };
export declare function dropView(mOptions: MigrationOptions): DropView;
export declare function createView(mOptions: MigrationOptions): CreateView;
export declare function alterView(mOptions: MigrationOptions): AlterView;
export declare function alterViewColumn(mOptions: MigrationOptions): AlterViewColumn;
export declare function renameView(mOptions: MigrationOptions): RenameView;
