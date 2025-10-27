import {demoFlaskTester} from "@/lib/actions/experience-actions";
import {ErrorResponse, PythonTester} from "@/lib/types";

export default async function DevPage() {
    const pythonTest: PythonTester | ErrorResponse = await demoFlaskTester()

    return (
        <div className="flex flex-col w-full text-center gap-2 items-center">
            <h1 className="text-4xl font-bold">Dev Page</h1>
            <p>
                {pythonTest.message}
            </p>
        </div>
    )
}