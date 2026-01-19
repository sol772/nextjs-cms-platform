import ResetPassword from "@/components/user/auth/ResetPassword";

export default async function ResetPasswordPage({
    params,
}: {
    params: Promise<{ memberId: string; token: string }>;
}) {
    const { memberId, token } = await params;
    return <ResetPassword memberId={memberId} token={token} />;
}
