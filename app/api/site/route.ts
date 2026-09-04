import { getPublicSiteData } from '@/lib/site-data';

export async function GET() {
  try {
    return Response.json(await getPublicSiteData());
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'تعذر تحميل بيانات القطّة.' }, { status: 500 });
  }
}
