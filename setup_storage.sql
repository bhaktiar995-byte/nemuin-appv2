-- Buat storage bucket baru bernama 'avatars' jika belum ada
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Hapus policy lama jika ada untuk menghindari konflik (opsional, disesuaikan)
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
drop policy if exists "Anyone can upload an avatar." on storage.objects;
drop policy if exists "Anyone can update their own avatar." on storage.objects;

-- Policy agar semua orang bisa melihat avatar secara publik
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Policy agar pengguna yang sudah login (authenticated) bisa mengupload avatar
create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- Policy agar pengguna yang sudah login (authenticated) bisa mengubah (update) avatar mereka sendiri
create policy "Anyone can update their own avatar."
  on storage.objects for update
  with check ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
