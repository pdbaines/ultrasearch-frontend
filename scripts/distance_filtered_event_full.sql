CREATE OR REPLACE FUNCTION 
	distance_filtered_event_full(km_lower numeric, km_upper numeric)
RETURNS TABLE(
	id bigint,
	created_at timestamp with time zone,
	name text,
	url text,
	start_date date,
	city text,
	state text,
	country text,
	latitude numeric,
	longitude numeric,
	event_distance_json jsonb,
	event_km_json numeric[],
	event_hours_json numeric[],
	event_render_json text[])
AS $$
SELECT
	expanded.id,
	expanded.created_at,
	expanded.name,
	expanded.url,
	expanded.start_date,
	expanded.city,
	expanded.state,
	expanded.country,
	expanded.latitude,
	expanded.longitude,
	expanded.event_distance_json,
	array_agg(expanded.event_km_single) as event_km_json,
	expanded.event_hours_json,
	expanded.event_render_json
FROM (
	SELECT * FROM (
		SELECT
			events.id,
    		events.created_at,
    		events.name,
    		events.url,
    		events.start_date,
    		events.city,
    		events.state,
    		events.country,
    		events.latitude,
    		events.longitude,
			events.event_distance_json,
			events.event_hours_json,
			events.event_render_json,
			unnest(event_km_json) as event_km_single
		FROM public.event_full events
	) as expanded_unfiltered
	WHERE expanded_unfiltered.event_km_single >= km_lower
	AND expanded_unfiltered.event_km_single <= km_upper
) as expanded
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14
$$
LANGUAGE SQL;
