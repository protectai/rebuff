-- Return 3 aggregate columns from the public.attempts table
CREATE OR REPLACE FUNCTION get_attempt_aggregates(user_id text)
RETURNS jsonb AS $$
BEGIN
    RETURN (
        SELECT jsonb_build_object(
            'breaches', jsonb_build_object('total', total_breach_cnt, 'user', user_breach_cnt),
            'detections', detections_cnt, 'requests', user_requests_cnt)
        FROM (
            SELECT
                coalesce(sum(case when breach then 1 else 0 end), 0) + 53 as total_breach_cnt,
                sum(case when breach and user_id = $1 then 1 else 0 end) as user_breach_cnt,
                sum(case when user_id = $1 then 1 else 0 end) as user_requests_cnt,
                sum(case when user_id = $1 and response->>'is_injection' = 'true' then 1 else 0 end) as detections_cnt
            FROM public.attempts
            WHERE user_id = $1
        ) a
    );
END;
$$ LANGUAGE plpgsql;