import type { DB as _DB } from './db.d.ts';

type OmittedSpatialRefSysSchema = Omit<_DB, 'spatial_ref_sys'>;
type OmittedGeographySchema = Omit<OmittedSpatialRefSysSchema, 'geography_columns' | 'geometry_columns'>;
type OmittedTopologySchema = Omit<OmittedGeographySchema, 'topology.layer' | 'topology.topology'>;
type DB = Omit<OmittedTopologySchema, 'tiger.addr' | 'tiger.addrfeat' | 'tiger.bg' | 'tiger.county' | 'tiger.county_lookup' | 'tiger.countysub_lookup' | 'tiger.cousub' | 'tiger.direction_lookup' | 'tiger.edges' | 'tiger.faces' | 'tiger.featnames' | 'tiger.geocode_settings' | 'tiger.geocode_settings_default' | 'tiger.loader_lookuptables' | 'tiger.loader_platform' | 'tiger.loader_variables' | 'tiger.pagc_gaz' | 'tiger.pagc_lex' | 'tiger.pagc_rules' | 'tiger.place' | 'tiger.place_lookup' | 'tiger.secondary_unit_lookup' | 'tiger.state' | 'tiger.state_lookup' | 'tiger.street_type_lookup' | 'tiger.tabblock' | 'tiger.tabblock20' | 'tiger.tract' | 'tiger.zcta5' | 'tiger.zip_lookup' | 'tiger.zip_lookup_all' | 'tiger.zip_lookup_base' | 'tiger.zip_state' | 'tiger.zip_state_loc'>;

export type Schema = DB;
