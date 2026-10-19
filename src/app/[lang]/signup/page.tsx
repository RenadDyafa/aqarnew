import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/AuthForms";

export async function generateMetadata({ params }: PageProps<"/[lang]/signup">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).auth.metaSignUp, robots: { index: false } };
}

export default async function SignUpPage({ params }: PageProps<"/[lang]/signup">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <AuthShell t={t} title={t.auth.signUpTitle} intro={t.auth.signUpIntro}>
      <SignUpForm t={t} />
    </AuthShell>
  );
}
