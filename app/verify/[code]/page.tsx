import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function VerifyPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code);

  const cert = await prisma.certificate.findFirst({
    where: {
      OR: [
        { certificateNumber: code },
        { verifyToken: code },
        { id: code }
      ]
    },
    include: { student: true, course: true }
  });

  if (!cert || cert.status === 'REVOKED') return notFound();

  return (
    <div dir="rtl" className="min-h-screen bg-[#0a0f14] text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white/5 backdrop-blur border border-white/10 rounded- p-8 text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#0e9bb1] to-[#e86c2c] rounded-full flex items-center justify-center text-3xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">شهادة موثقة ✅</h1>
        <p className="text-white/60 mb-6">تم التحقق من الشهادة بنجاح من منصة تصويرك</p>
        <div className="bg-white text-black rounded-2xl p-6 text-right space-y-3">
          <div><span className="text-black/50">الطالب:</span> <b>{cert.student.name}</b></div>
          <div><span className="text-black/50">الدورة:</span> <b>{cert.course.title}</b></div>
          <div><span className="text-black/50">تاريخ الإصدار:</span> <b>{new Date(cert.issuedAt).toLocaleDateString('ar-SA')}</b></div>
          <div><span className="text-black/50">رقم الشهادة:</span> <b className="font-mono">{cert.certificateNumber}</b></div>
          <div><span className="text-black/50">كود التحقق:</span> <b className="font-mono text-xs break-all">{cert.verifyToken}</b></div>
        </div>
        <p className="text-xs text-white/30 mt-6">learn.taswerak.com/verify/{cert.certificateNumber}</p>
      </div>
    </div>
  );
}