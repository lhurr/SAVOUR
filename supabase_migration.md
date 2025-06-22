## Instructions for database migration on Supabase
1. Create new migration and fill in with updated SQL inside the file
```bash
supabase migration new create_employees_table
```

2. Apply migration
```bash
supabase migration up
```

3. [OPTIONAL] To modify tables
```bash
supabase migration new <COLUMN>
```

4. [OPTIONAL] Apply new migration
```bash
supabase migration up
```


5. Deploy project to Supabase
```bash
supabase login
supabase link
supabase db push
```