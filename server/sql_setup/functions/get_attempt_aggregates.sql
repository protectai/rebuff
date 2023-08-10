-- Return 3 aggregate columns from the public.attempts table
  select jsonb_build_object('breaches',jsonb_build_object('total',total_breach_cnt,'user',user_breach_cnt),'detections',detections_cnt,'requests',user_requests_cnt)
  FROM
  (SELECT
    -- sum of all rows where breach is true
    coalesce(sum(case when breach then 1 else 0 end),0)+53 as total_breach_cnt,
    -- sum of all rows where breach is true and user_id matches the provided user_id
    sum(case when breach and user_id = $1 then 1 else 0 end) as user_breach_cnt,
    -- sum of all rows where user_id matches the provided user_id
    sum(case when user_id = $1 then 1 else 0 end) as user_requests_cnt,
    -- sum of all rows where user_id matches provided user_id and 'is_injection' in the response jsonb field is set to true
    sum(case when user_id = $1 and response->>'is_injection' = 'true' then 1 else 0 end) as detections_cnt
  from public.attempts
  where user_id = $1) a;