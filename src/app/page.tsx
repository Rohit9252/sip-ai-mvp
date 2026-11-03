import { App } from "@/components/app";
import { DeviceShell } from "@/components/device-shell/device-shell";
import { LangProvider } from "@/components/lang/lang-provider";

export default function Home() {
  return (
    <LangProvider>
      <DeviceShell>
        <App />
      </DeviceShell>
    </LangProvider>
  );
}
