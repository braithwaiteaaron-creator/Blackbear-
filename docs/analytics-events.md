# Analytics Event Map

## Acquisition

- `quiz_page_viewed`
  - Properties: `traffic_source`, `utm_source`, `utm_medium`, `utm_campaign`
- `quiz_started`
  - Properties: `device_type`, `traffic_source`, `tier_started`
- `account_created`
  - Properties: `auth_provider`, `source_tier_gate`

## Engagement

- `question_answered`
  - Properties: `question_id`, `tier`, `is_correct`, `time_on_question`
- `tier_completed`
  - Properties: `tier`, `tier_score`, `time_to_complete`, `device_type`
- `quiz_completed`
  - Properties: `total_score`, `beginner_score`, `intermediate_score`, `advanced_score`
- `rationale_read_time`
  - Properties: `question_id`, `time_ms`

## Conversion

- `badge_issued`
  - Properties: `badge_tier`, `total_score`, `issued_at`
- `badge_shared`
  - Properties: `badge_tier`, `platform`, `referral_code`
- `upgrade_prompt_viewed`
  - Properties: `score_tier`, `placement_variant`
- `upgrade_clicked`
  - Properties: `score_tier`, `cta_label`
- `subscription_purchased`
  - Properties: `subscription_tier`, `price`, `attribution_source`
- `certification_purchased`
  - Properties: `certification_tier`, `price`, `score_at_purchase`

## Enterprise

- `diagnostic_report_requested`
  - Properties: `organization_size`, `requester_role`, `traffic_source`
- `diagnostic_report_delivered`
  - Properties: `report_completeness_score`, `delivery_time_minutes`
- `enterprise_demo_booked`
  - Properties: `organization_size`, `source`, `booker_score_tier`
