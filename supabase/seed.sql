insert into public.product_categories (slug, name, description, sort_order, status)
values
  ('bamboo-products', 'Bamboo Products', 'Bamboo sticks and fencing for garden, agriculture, retail, and project buyers.', 10, 'published'),
  ('packaging-materials', 'Packaging Materials', 'Stretch film and packaging tape for logistics, pallet wrapping, and carton sealing.', 20, 'published'),
  ('charcoal-biomass', 'Charcoal & Biomass', 'BBQ charcoal and biochar pages separated by buyer use case and document needs.', 30, 'published'),
  ('natural-furniture', 'Natural Furniture', 'Rattan and bamboo furniture sourcing for hospitality, retail, and project orders.', 40, 'published')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  status = excluded.status;

with categories as (
  select id, slug from public.product_categories
)
insert into public.products (
  category_id,
  slug,
  name,
  short_description,
  long_description,
  applications,
  specifications,
  packing_options,
  moq,
  lead_time,
  documents,
  seo_title,
  seo_description,
  status
)
values
  ((select id from categories where slug = 'bamboo-products'), 'bamboo-sticks', 'Bamboo Sticks', 'Export-ready bamboo sticks for garden, agriculture, and retail packing.', 'Natural bamboo sticks prepared for B2B export buyers who need clear size, packing, MOQ, and documentation discussion before quotation.', '["Garden stakes","Agriculture support","Retail garden packs"]', '["Length and diameter by request","Natural or treated finish","Straightness tolerance by agreement"]', '["Bundle packing","Carton packing","Pallet packing with export marks"]', 'Contact for details by size and packing.', 'Subject to confirmed size, quantity, season, and packing plan.', '["Commercial invoice","Packing list","Certificate of Origin support if applicable"]', 'Bamboo Sticks Supplier Vietnam', 'Export-ready bamboo sticks from Vietnam with structured sourcing request support.', 'published'),
  ((select id from categories where slug = 'bamboo-products'), 'bamboo-fence', 'Bamboo Fence', 'Rolled or panel bamboo fencing for garden, resort, landscaping, and DIY retail channels.', 'Bamboo fence requests should clarify roll height, roll length, finish, label needs, destination port, and target quantity before quotation.', '["Garden retail","Resort landscaping","DIY outdoor privacy screens"]', '["Roll or panel format","Natural or treated finish","Retail label available by project"]', '["Bundle packing","Carton packing","Pallet packing with loading plan"]', 'Contact for details. MOQ depends on roll size, finish, and packing.', 'Subject to order quantity and confirmed specification.', '["Commercial invoice","Packing list","Fumigation or phytosanitary support if applicable"]', 'Bamboo Fence Supplier Vietnam', 'Vietnam bamboo fence sourcing for garden and retail buyers.', 'published'),
  ((select id from categories where slug = 'packaging-materials'), 'packaging-tape', 'Packaging Tape', 'Carton sealing tape for packing, warehouse, and logistics operations.', 'Packaging tape requests should capture width, length, thickness, color, core size, monthly quantity, and carton packing needs.', '["Carton sealing","Warehouse packing","Export logistics supply"]', '["Clear or tinted options","Hand and machine use","Carton sealing application"]', '["Shrink pack","Carton packing","Pallet packing"]', 'Contact for details by tape size and order program.', 'Subject to size, color, adhesive requirement, and production plan.', '["Commercial invoice","Packing list","Specification sheet if required"]', 'Packaging Tape Supplier Vietnam', 'Packaging tape sourcing from Vietnam for carton sealing and logistics buyers.', 'published'),
  ((select id from categories where slug = 'packaging-materials'), 'stretch-film', 'Stretch Film', 'Industrial stretch film for pallet wrapping and export logistics.', 'Stretch film sourcing needs clear thickness, width, roll weight, hand or machine roll type, color, and delivery destination.', '["Pallet wrapping","Warehouse operations","Export container loading"]', '["Hand roll or machine roll","Clear or tinted film","Thickness by request"]', '["Carton packing","Pallet packing","Private label by project"]', 'Contact for details by roll type and packing.', 'Subject to order quantity, film specification, and production plan.', '["Commercial invoice","Packing list","Specification sheet if required"]', 'Stretch Film Supplier Vietnam', 'Stretch film sourcing for pallet wrapping and export logistics.', 'published'),
  ((select id from categories where slug = 'charcoal-biomass'), 'bbq-charcoal', 'BBQ Charcoal', 'BBQ charcoal sourcing for retail, food service, and private label programs.', 'BBQ charcoal pages must avoid unsupported claims and should verify moisture, ash, bag packing, and lab data before publishing or quotation.', '["BBQ retail","Food service","Private label charcoal programs"]', '["Lump or briquette discussion","Moisture target by agreement","Ash target by agreement"]', '["Retail bag","Master carton","Pallet packing"]', 'Contact for details by charcoal type and packing.', 'Subject to packing, verified specification, and available production plan.', '["Commercial invoice","Packing list","Lab report only if verified"]', 'BBQ Charcoal Exporter Vietnam', 'BBQ charcoal sourcing for retail and food service buyers.', 'published'),
  ((select id from categories where slug = 'charcoal-biomass'), 'biochar', 'Biochar', 'Biochar sourcing for agriculture and soil amendment buyers.', 'Biochar requests should separate agricultural application needs from BBQ charcoal requirements and verify lab data before claims.', '["Soil amendment","Agriculture projects","Bulk material programs"]', '["Particle size by request","Bulk bag option","Application-focused positioning"]', '["Bulk bag","Small bag by project","Pallet packing"]', 'Contact for details by packing and application.', 'Subject to verified specification, quantity, and packing plan.', '["Commercial invoice","Packing list","Lab report only if verified"]', 'Biochar Supplier Vietnam', 'Biochar sourcing for agriculture and soil amendment buyers.', 'published'),
  ((select id from categories where slug = 'natural-furniture'), 'rattan-furniture', 'Rattan Furniture', 'Natural rattan and bamboo furniture for hospitality, retail, and project buyers.', 'Furniture sourcing should collect design reference, material, finish, cushion needs, packing, and sample discussion before quotation.', '["Hospitality projects","Retail furniture programs","Interior and outdoor collections"]', '["Natural rattan and bamboo options","Custom finish discussion","Project or retail packing"]', '["Carton packing","Protective wrap","Loading plan by item type"]', 'Contact for details by item type and project scope.', 'Subject to sample approval, material, quantity, and packing plan.', '["Commercial invoice","Packing list","Catalogue or spec sheet if available"]', 'Rattan Furniture Exporter Vietnam', 'Rattan and bamboo furniture sourcing for hospitality and retail buyers.', 'published')
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  short_description = excluded.short_description,
  long_description = excluded.long_description,
  applications = excluded.applications,
  specifications = excluded.specifications,
  packing_options = excluded.packing_options,
  moq = excluded.moq,
  lead_time = excluded.lead_time,
  documents = excluded.documents,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  status = excluded.status;
