-- Remove the existing SELECT policy - contact messages should only be viewable by admins via backend
DROP POLICY IF EXISTS "Users can view their own messages" ON public.contact_messages;