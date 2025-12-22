import React from 'react';
import { ShieldCheck, Scale, Lock, FileText } from 'lucide-react';

const LegalLayout: React.FC<{ title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, icon, children }) => (
  <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="mb-8 border-b-4 border-neo-black pb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-neo-black text-white p-3 shadow-neo">
            {icon}
        </div>
        <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">{title}</h1>
            <p className="font-mono text-sm text-gray-600 mt-1 uppercase">{subtitle}</p>
        </div>
      </div>
    </div>
    <div className="bg-white border-4 border-neo-black shadow-neo p-8 md:p-12 font-mono text-sm leading-relaxed space-y-8">
        {children}
    </div>
  </div>
);

export const EUCompliance: React.FC = () => (
  <LegalLayout 
    title="EU AI Act Compliance" 
    subtitle="(Article 52 & Transparency Obligations)"
    icon={<Scale size={32} />}
  >
    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">1. Regulatory Positioning</h3>
        <p className="mb-2">
            AuthAI.pro operates as a provider of AI-enabled forensic analysis services within the meaning of Regulation (EU) 2024/… (EU AI Act) and is classified under limited-risk AI systems used for content origin assessment and transparency disclosure.
        </p>
        <p className="mb-2">AuthAI.pro does not deploy high-risk AI systems as defined under Chapter III of the EU AI Act.</p>
        <div className="pl-4 border-l-2 border-neo-black my-2">
            <p><strong>Legal Basis:</strong></p>
            <ul className="list-disc ml-4">
                <li>EU AI Act – Articles 3, 5, 52</li>
                <li>Recital provisions relating to transparency and disclosure obligations</li>
            </ul>
        </div>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">2. Transparency & Disclosure Obligations</h3>
        <p className="mb-2">Pursuant to Article 52, AuthAI.pro ensures that:</p>
        <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>Users are explicitly informed that:
                <ul className="list-square ml-5 mt-1">
                    <li>The service performs probabilistic AI-origin analysis</li>
                    <li>Outputs are likelihood-based, not absolute determinations</li>
                </ul>
            </li>
            <li>All verification results:
                <ul className="list-square ml-5 mt-1">
                    <li>Clearly disclose confidence scores</li>
                    <li>State the methodological limitations</li>
                    <li>Identify the time of assessment</li>
                </ul>
            </li>
        </ul>
        <p>AuthAI.pro does not engage in deception, manipulation, or concealed AI usage.</p>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">3. Human Oversight</h3>
        <p>Verification results are machine-generated but human-governed.</p>
        <p className="mb-2">Administrative overrides, where permitted, are:</p>
        <ul className="list-disc ml-5 mb-2">
            <li>Logged</li>
            <li>Auditable</li>
            <li>Non-destructive to original records</li>
        </ul>
        <p className="text-xs text-gray-500">Compliance Proof: Human-in-the-loop governance aligns with Article 14 requirements.</p>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">4. Risk Mitigation & Safeguards</h3>
        <p>AuthAI.pro implements:</p>
        <ul className="list-disc ml-5 mb-2">
            <li>Bias monitoring across detection models</li>
            <li>Regular accuracy benchmarking</li>
            <li>Dataset diversification</li>
            <li>False-positive mitigation controls</li>
        </ul>
        <p className="text-xs text-gray-500">Legal Justification: Meets proportionality and risk mitigation obligations under EU AI Act.</p>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">5. Prohibited Practices Declaration</h3>
        <p>AuthAI.pro does not:</p>
        <ul className="list-disc ml-5">
            <li>Perform social scoring</li>
            <li>Conduct biometric identification</li>
            <li>Engage in covert surveillance</li>
            <li>Produce autonomous legal or medical decisions</li>
        </ul>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">6. Ongoing Compliance Commitment</h3>
        <p>AuthAI.pro commits to:</p>
        <ul className="list-disc ml-5">
            <li>Periodic model audits</li>
            <li>Regulatory cooperation</li>
            <li>Continuous updates aligned with EU AI Act amendments</li>
        </ul>
    </section>
  </LegalLayout>
);

export const TermsOfService: React.FC = () => (
  <LegalLayout 
    title="Terms of Forensic Service" 
    subtitle="(Digital Content Verification & Certification)"
    icon={<FileText size={32} />}
  >
    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">1. Nature of Service</h3>
        <p>AuthAI.pro provides forensic AI-origin assessment services for digital content including text, images, audio, video, source code, and documents.</p>
        <p>The service constitutes a technical opinion based on statistical inference, not a declaration of authorship or ownership.</p>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">2. No Absolute Determination</h3>
        <p>Users expressly acknowledge that:</p>
        <ul className="list-disc ml-5 mb-2">
            <li>AI-origin detection is probabilistic</li>
            <li>Results reflect likelihood at the time of analysis</li>
            <li>No guarantee of absolute accuracy is provided</li>
        </ul>
        <p className="text-xs text-gray-500">Legal Precedent: Probabilistic forensic methods are accepted when properly disclosed.</p>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">3. Certificate Scope & Validity</h3>
        <p>Certificates issued by AuthAI.pro:</p>
        <ul className="list-disc ml-5 mb-2">
            <li>Are bound to a specific content hash</li>
            <li>Reflect analysis conducted at a specific timestamp</li>
            <li>Become invalid upon content alteration</li>
        </ul>
        <p>Certificates do not:</p>
        <ul className="list-disc ml-5">
            <li>Assign copyright</li>
            <li>Transfer ownership</li>
            <li>Replace legal due diligence</li>
        </ul>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">4. Badge & Watermark Usage</h3>
        <p>Badges and watermarks:</p>
        <ul className="list-disc ml-5 mb-2">
            <li>May be used solely with the certified content</li>
            <li>Must not be modified, resized disproportionately, or misrepresented</li>
            <li>Must link to the official verification page</li>
        </ul>
        <p className="font-bold text-neo-red">Unauthorized usage constitutes misrepresentation and fraud.</p>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">5. Limitation of Liability</h3>
        <p>To the maximum extent permitted by law:</p>
        <ul className="list-disc ml-5">
            <li>AuthAI.pro shall not be liable for indirect, incidental, or consequential damages</li>
            <li>Total liability shall not exceed the amount paid for the relevant certificate</li>
        </ul>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">6. Prohibited Use</h3>
        <p>Users shall not:</p>
        <ul className="list-disc ml-5 mb-2">
            <li>Submit illegal, infringing, or malicious content</li>
            <li>Attempt to reverse-engineer detection models</li>
            <li>Use certificates for deceptive or unlawful purposes</li>
        </ul>
        <p className="font-bold text-neo-red">Violation may result in immediate service termination.</p>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">7. Governing Law & Jurisdiction</h3>
        <p>Unless otherwise mandated:</p>
        <ul className="list-disc ml-5">
            <li>Governing Law: Republic of India</li>
            <li>Jurisdiction: Bengaluru Courts</li>
            <li>EU consumer protections remain unaffected where applicable</li>
        </ul>
    </section>
  </LegalLayout>
);

export const PrivacyProtocol: React.FC = () => (
  <LegalLayout 
    title="Privacy Protocol" 
    subtitle="(GDPR, DPDP & Global Data Protection Alignment)"
    icon={<Lock size={32} />}
  >
    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">1. Data Controller Status</h3>
        <p>AuthAI.pro acts as a Data Controller for user account data and a Data Processor for uploaded content strictly for verification purposes.</p>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">2. Data Collected</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="border-2 border-neo-black p-3 bg-white">
                <h4 className="font-bold border-b-2 border-neo-black mb-2 pb-1">2.1 User Data</h4>
                <ul className="list-disc ml-4">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Authentication metadata</li>
                    <li>Payment transaction references (no card storage)</li>
                </ul>
            </div>
            <div className="border-2 border-neo-black p-3 bg-white">
                <h4 className="font-bold border-b-2 border-neo-black mb-2 pb-1">2.2 Content Data</h4>
                <ul className="list-disc ml-4">
                    <li>Uploaded files or text</li>
                    <li>Generated content hashes</li>
                    <li>Verification metadata</li>
                </ul>
            </div>
        </div>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">3. Purpose Limitation</h3>
        <p>Data is processed solely for:</p>
        <ul className="list-disc ml-5">
            <li>Content verification</li>
            <li>Certificate issuance</li>
            <li>Fraud prevention</li>
            <li>Regulatory compliance</li>
        </ul>
        <p className="mt-2">No data is used for advertising or profiling.</p>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">4. Data Retention</h3>
        <div className="overflow-x-auto border-2 border-neo-black">
            <table className="w-full text-left">
                <thead className="bg-neo-black text-white">
                    <tr>
                        <th className="p-2 border-r border-white">Data Type</th>
                        <th className="p-2">Retention</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-neo-black">
                        <td className="p-2 border-r border-neo-black">Content Files</td>
                        <td className="p-2">Deleted after processing (unless opted-in)</td>
                    </tr>
                    <tr className="border-b border-neo-black">
                        <td className="p-2 border-r border-neo-black">Content Hashes</td>
                        <td className="p-2">Retained for certificate validation</td>
                    </tr>
                    <tr className="border-b border-neo-black">
                        <td className="p-2 border-r border-neo-black">Certificates</td>
                        <td className="p-2">Retained for verification lifecycle</td>
                    </tr>
                    <tr>
                        <td className="p-2 border-r border-neo-black">Payment Records</td>
                        <td className="p-2">As required by law</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">5. Security Measures</h3>
        <p>AuthAI.pro employs:</p>
        <ul className="list-disc ml-5">
            <li>AES-256 encryption at rest</li>
            <li>TLS 1.3 in transit</li>
            <li>Role-based access control</li>
            <li>Immutable audit logs</li>
            <li>HSM-protected keys</li>
        </ul>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">6. User Rights</h3>
        <p>Users have the right to:</p>
        <ul className="list-disc ml-5">
            <li>Access their data</li>
            <li>Rectify inaccuracies</li>
            <li>Request deletion (where legally permissible)</li>
            <li>Withdraw consent</li>
            <li>Data portability (GDPR Article 20)</li>
        </ul>
        <p className="text-xs text-gray-500 mt-1">Requests are processed within statutory timelines.</p>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">7. Cross-Border Transfers</h3>
        <p>Where applicable, data transfers comply with:</p>
        <ul className="list-disc ml-5">
            <li>Standard Contractual Clauses (SCCs)</li>
            <li>Adequacy decisions</li>
            <li>Applicable national data laws</li>
        </ul>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">8. Automated Decision Disclosure</h3>
        <p>AuthAI.pro uses automated processing. Users are informed of:</p>
        <ul className="list-disc ml-5">
            <li>Logic involved</li>
            <li>Significance of outcomes</li>
            <li>Limitations of automation</li>
        </ul>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">9. Breach Notification</h3>
        <p>In the event of a data breach:</p>
        <ul className="list-disc ml-5">
            <li>Authorities will be notified as required</li>
            <li>Impacted users will be informed without undue delay</li>
        </ul>
    </section>

    <section>
        <h3 className="font-bold text-lg mb-2 bg-neo-grey inline-block px-2 border border-neo-black">10. Updates to This Protocol</h3>
        <p>This Privacy Protocol may be updated to reflect:</p>
        <ul className="list-disc ml-5">
            <li>Legal changes</li>
            <li>Security enhancements</li>
            <li>Platform evolution</li>
        </ul>
        <p>Material changes will be notified.</p>
    </section>
  </LegalLayout>
);