DECLARE
    new_credits_total_cents_10k int4;
BEGIN
    UPDATE accounts a SET credits_total_cents_10k = a.credits_total_cents_10k - rate
    WHERE a.user_apikey = input_api_key
    RETURNING a.credits_total_cents_10k INTO new_credits_total_cents_10k;

    RETURN new_credits_total_cents_10k;
END;