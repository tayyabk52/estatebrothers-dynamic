import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const sourceBase = "https://www.estatebrothers.pk/assets/";
const outputDir = "docs/content-migration/original-media";
const assets = [
  ["team","ceo-tajamal-hussain-Cx3eVEUM.jpg","Tajamal Hussain"],
  ["team","ceo-tajamal-hussain-BVJjBvAk.jpg","Tajamal Hussain at the Estate Brothers office"],
  ["team","abdur-rehman-branch-manager-DfBLG-Ly.jpg","Abdur Rehman"],
  ["team","faizan-ahmed-director-sales-VzbDVLVQ.jpg","Faizan Ahmed"],
  ["team","m-d-ahmad-raza-t2LdvAQb.jpg","Ahmad Raza"],
  ["team","usman-butt-sales-executive-DVSFyJ-Y.jpg","Usman Butt"],
  ["team","abdul-hannan-sales-executive-BadvwqKN.jpg","Abdul Hannan"],
  ["team","abdul-waheed-sales-executive-BPWahg0r.jpg","Abdul Waheed"],
  ["team","chaudhary-kamran-sales-executive-VwaC5_JE.jpg","Chaudhary Kamran"],
  ["team","sheraz-ahmad-sales-executive-Dbo3rNHv.jpg","Sheraz Ahmad"],
  ["team","abdur-rehman-sales-executive-DrB3H2r3.jpg","Abdur Rehman, Sales Executive"],
  ["team","chaudhary-iftikhar-HXCd39iY.jpg","Chaudhary Iftikhar"],
  ["office","office-BtppWhvx.webp","Main DHA Office - 44-A DHA Phase 6, Lahore"],
  ...Array.from({length:13},(_,i)=>["gallery",`gallery-${String(i+1).padStart(2,"0")}-${["cRN19fyF","CM9js5FE","wNEcUB9M","WwCA9PQe","BRJgHPf3","ClKqrRUv","BcciGYlF","CVA-jN37","BRNeTqNN","BWXzXv_K","ComzkJbG","B-44AxFk","F9Kxp_Vy"][i]}.jpg`,`Estate Brothers event and office gallery image ${i+1}`]),
  ["projects","project-01-Caaq8vIP.jpg","Al Ghani Garden Phase 7 project view"],
  ["projects","project-01-DfYLjvXq.jpg","DHA Lahore project view"],
  ["projects","project-01-qf-h6P_V.jpg","Green Palms Lahore by Rafi Group project view"],
  ["projects","project-01-D8MzJK9i.jpg","Safari Garden project view"],
  ["partners","partner-01-nP9U2Pe7.webp","Estate Brothers partner logo 01"],
  ["partners","partner-02-DBf_IhD-.webp","Estate Brothers partner logo 02"],
  ["partners","partner-03--pW-FGcd.webp","Estate Brothers partner logo 03"],
  ["partners","partner-04-2sOWY86c.webp","Estate Brothers partner logo 04"],
  ["partners","partner-06-BuWbb7sY.webp","Estate Brothers partner logo 06"],
  ["partners","partner-07-ql1mCfH1.webp","Estate Brothers partner logo 07"],
  ["partners","partner-08-6CoM7m4f.webp","Estate Brothers partner logo 08"],
  ["partners","partner-09-C_h1oa1_.webp","Estate Brothers partner logo 09"],
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase server credentials");
const supabase = createClient(url, key, {auth:{persistSession:false,autoRefreshToken:false}});
const downloadOnly = process.env.DOWNLOAD_ONLY === "1";
await mkdir(outputDir, {recursive:true});
const uploaded = [];
try {
  for (const [group,file,alt] of assets) {
    const sourceUrl = sourceBase + file;
    const response = await fetch(sourceUrl, {signal:AbortSignal.timeout(30000)});
    if (!response.ok) throw new Error(`${response.status} fetching ${sourceUrl}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const mime = response.headers.get("content-type")?.split(";")[0] || (file.endsWith(".webp") ? "image/webp" : "image/jpeg");
    const digest = createHash("sha256").update(bytes).digest("hex");
    const localFolder = join(outputDir, group);
    await mkdir(localFolder, {recursive:true});
    await writeFile(join(localFolder, basename(file)), bytes);
    if (downloadOnly) {
      uploaded.push({group,file,alt,sourceUrl,sha256:digest,size:bytes.length});
      console.log(`downloaded ${group}/${file} (${bytes.length} bytes)`);
      continue;
    }
    const storagePath = `static-site-migration/${group}/${file}`;
    const existing = await supabase.from("media_assets").select("id,public_url").eq("storage_bucket","site-assets").eq("storage_path",storagePath).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) {
      uploaded.push({group,file,alt,sourceUrl,sha256:digest,size:bytes.length,...existing.data,reused:true});
      continue;
    }
    const put = await supabase.storage.from("site-assets").upload(storagePath, bytes, {contentType:mime,upsert:false,cacheControl:"31536000"});
    if (put.error) throw put.error;
    const publicUrl = supabase.storage.from("site-assets").getPublicUrl(storagePath).data.publicUrl;
    const inserted = await supabase.from("media_assets").insert({
      source_type:"upload",media_type:"image",storage_bucket:"site-assets",storage_path:storagePath,
      public_url:publicUrl,title:alt,alt_text:alt,mime_type:mime,file_size_bytes:bytes.length,
      status:"published"
    }).select("id,public_url").single();
    if (inserted.error) {
      await supabase.storage.from("site-assets").remove([storagePath]);
      throw inserted.error;
    }
    uploaded.push({group,file,alt,sourceUrl,sha256:digest,size:bytes.length,...inserted.data,reused:false});
    console.log(`uploaded ${group}/${file} (${bytes.length} bytes)`);
  }
  await writeFile("docs/content-migration/original-media-manifest.json", JSON.stringify(uploaded,null,2)+"\n");
  console.log(`complete: ${uploaded.length} validated source images`);
} catch (error) {
  console.error(error);
  process.exitCode=1;
}
