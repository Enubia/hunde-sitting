import type { DB as _DB } from './db.d.ts';

type OmittedSpatialRefSysSchema = Omit<_DB, 'spatial_ref_sys'>;
type DB = Omit<OmittedSpatialRefSysSchema, 'geography_columns' | 'geometry_columns'>;

export type Schema = DB;
