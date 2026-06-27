-- ============================================================
-- Update handle_new_user trigger & fix existing profiles
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Recreate the handle_new_user function to update is_anonymous on conflict
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_username     text;
  v_is_anon      boolean;
  v_user_type    public.user_type_enum;
  v_display_name text;
  v_email        text;
  v_avatar_url   text;
  v_raw_type     text;
begin
  v_email := coalesce(new.email, new.raw_user_meta_data->>'email');

  v_is_anon := coalesce(
    (new.raw_user_meta_data->>'is_anonymous')::boolean,
    v_email like '%@anon.whrdhub.org' or v_email like '%@ussd.whrdhub.org',
    false
  );

  -- Cast user_type safely from metadata text to enum
  v_raw_type := coalesce(new.raw_user_meta_data->>'user_type', 'reporter');
  begin
    v_user_type := v_raw_type::public.user_type_enum;
  exception when invalid_text_representation then
    v_user_type := 'reporter';
  end;

  -- Extract display name (Google OAuth sends full_name, some providers send name)
  v_display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name'
  );

  -- Extract avatar URL from Google OAuth (avatar_url or picture)
  v_avatar_url := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture'
  );

  -- Generate username
  v_username := coalesce(
    new.raw_user_meta_data->>'username',
    case
      when v_email is not null
        and v_email not like '%@anon.whrdhub.org'
        and v_email not like '%@ussd.whrdhub.org'
      then regexp_replace(split_part(v_email, '@', 1), '[^a-zA-Z0-9_-]', '', 'g')
           || '-' || left(new.id::text, 4)
      else 'user-' || left(new.id::text, 8)
    end
  );

  insert into public.profiles (id, username, display_name, email, is_anonymous, user_type, avatar_url)
  values (new.id, v_username, v_display_name, v_email, v_is_anon, v_user_type, v_avatar_url)
  on conflict (id) do update set
    email        = coalesce(excluded.email, public.profiles.email),
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    avatar_url   = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    is_anonymous = excluded.is_anonymous;

  return new;
end;
$$;

-- 2. Correct any existing profiles where the user logged in with a real email
-- but got flagged as anonymous.
update public.profiles
set is_anonymous = false
where email not like '%@anon.whrdhub.org'
  and email not like '%@ussd.whrdhub.org'
  and is_anonymous = true;
