import Policy from "@/components/user/policy/Policy";

interface PolicyPageProps {
    params: Promise<{
        locale: string;
        policyType: string;
    }>;
}

export default async function PolicyPage({ params }: PolicyPageProps) {
    const { policyType } = await params;
    return <Policy policyType={policyType} />;
}
