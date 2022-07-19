
CREATE MATERIALIZED VIEW IF NOT EXISTS public.event_full
TABLESPACE pg_default
AS
 SELECT events.id,
    events.created_at,
    events.name,
    events.url,
    events.start_date,
    events.city,
    events.state,
    events.country,
    events.latitude,
    events.longitude,
    jsonb_agg(json_build_object('distance', event_distances.distance, 'unit_name', distance_units.unit_name)) AS event_distance_json,
    array_agg(event_distances.distance * distance_units.unit_to_km) AS event_km_json,
    array_agg(
        CASE
            WHEN distance_units.unit_name = 'hour'::text THEN event_distances.distance
            ELSE NULL::numeric
        END) AS event_hours_json,
    array_agg((event_distances.distance::text || ' '::text) || distance_units.unit_name) AS event_render_json
   FROM events events
     LEFT JOIN event_distances event_distances ON events.id = event_distances.event_id
     LEFT JOIN distance_units distance_units ON event_distances.distance_unit_id = distance_units.id
  GROUP BY events.id
  ORDER BY events.id
WITH DATA;

ALTER TABLE IF EXISTS public.event_full
    OWNER TO postgres;

GRANT ALL ON TABLE public.event_full TO authenticated;
GRANT ALL ON TABLE public.event_full TO postgres;
GRANT ALL ON TABLE public.event_full TO anon;
GRANT ALL ON TABLE public.event_full TO service_role;
