import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { withSupabase } from "jsr:@supabase/server@^1";



const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");



if (!OPENAI_API_KEY) {

    throw new Error("OPENAI_API_KEY is not configured");

}



// --------------------------------------------------

// Types

// --------------------------------------------------



interface UniversityResult {

    name: string;

    official_website: string;

    admissions_url: string;

    international_url: string;

    city: string;

    university_type: string;

    country: string;

    source_url: string;

    summary: string;

    confidence_score: number;

}



interface VerificationResult {

    name: string;

    official_website: string;

    admissions_url: string;

    international_url: string;

    city: string;

    university_type: string;

    country: string;

    source_url: string;

    summary: string;

    confidence_score: number;

    verification_status: "verified" | "needs_review" | "rejected";

    verification_notes: string;

}



interface DiscoveryResponse {

    universities: UniversityResult[];

}



interface ProgrammeResult {

    name: string;

    degree_level: string;

    subject: string;

    field: string;

    description: string;

    duration: string;

    study_mode: string;

    language: string;

    tuition_fee: string;

    tuition_currency: string;

    international_students: string;

    programme_url: string;

    application_url: string;

    source_url: string;

    confidence_score: number;

}



interface ProgrammeDiscoveryResponse {

    programmes: ProgrammeResult[];

}



interface ProgrammeVerificationResult {

    name: string;

    degree_level: string;

    subject: string;

    field: string;

    description: string;

    duration: string;

    study_mode: string;

    language: string;

    tuition_fee: string;

    tuition_currency: string;

    international_students: string;

    programme_url: string;

    application_url: string;

    source_url: string;

    confidence_score: number;

    verification_status: "verified" | "needs_review" | "rejected";

    verification_notes: string;

}



interface ProgrammeVerificationResponse {

    verification: ProgrammeVerificationResult;

}



interface AdmissionResult {

    programme_name: string;

    intake: string;

    academic_year: string;

    application_open: string;

    application_deadline: string;

    international_deadline: string;

    programme_start_date: string;

    application_url: string;

    source_url: string;

    status: "upcoming" | "open" | "closed" | "unknown";

    confidence_score: number;

    notes: string;

}



interface AdmissionDiscoveryResponse {

    admissions: AdmissionResult[];

}



interface ScholarshipResult {

    name: string;

    provider: string;

    country: string;

    degree_level: string;

    field: string;

    description: string;

    funding_type: string;

    amount: string;

    currency: string;

    eligibility: string;

    application_open: string;

    deadline: string;

    official_url: string;

    application_url: string;

    status: "upcoming" | "open" | "closed" | "unknown";

    confidence_score: number;

    notes: string;

}



interface ScholarshipDiscoveryResponse {

    scholarships: ScholarshipResult[];

}

interface PhDPositionResult {
    title: string;
    university: string;
    research_institution: string;
    department: string;
    research_area: string;
    description: string;
    supervisor: string;
    funding_type: string;
    funding_amount: string;
    funding_currency: string;
    salary: string;
    eligibility: string;
    application_open: string;
    deadline: string;
    start_date: string;
    official_url: string;
    application_url: string;
    status: "open" | "closed" | "unknown";
    confidence_score: number;
    notes: string;
}

interface PhDPositionDiscoveryResponse {
    positions: PhDPositionResult[];
}

interface PhDPositionVerificationResult extends PhDPositionResult {
    verification_status: "verified" | "needs_review" | "rejected";
    verification_notes: string;
}

interface PhDPositionVerificationResponse {
    verification: PhDPositionVerificationResult;
}

interface ScholarshipVerificationResult {
    name: string;
    provider: string;
    country: string;
    degree_level: string;
    field: string;
    description: string;
    funding_type: string;
    amount: string;
    currency: string;
    eligibility: string;
    application_open: string;
    deadline: string;
    official_url: string;
    application_url: string;
    status: "upcoming" | "open" | "closed" | "unknown";
    confidence_score: number;
    verification_status: "verified" | "needs_review" | "rejected";
    verification_notes: string;
}

interface ScholarshipVerificationResponse {
    verification: ScholarshipVerificationResult;
}



interface DeadlineVerificationResult {

    name: string;

    programme_name: string;

    intake: string;

    academic_year: string;

    application_open: string;

    application_deadline: string;

    international_deadline: string;

    programme_start_date: string;

    application_url: string;

    source_url: string;

    status: "upcoming" | "open" | "closed" | "unknown";

    confidence_score: number;

    verification_status: "verified" | "needs_review" | "rejected";

    verification_notes: string;

}



interface DeadlineVerificationResponse {

    verification: DeadlineVerificationResult;

}




interface VerificationResponse {

    verification: VerificationResult;

}



// --------------------------------------------------

// Main Edge Function

// --------------------------------------------------

export default {

fetch: withSupabase({ auth: ["secret", "secret:floot_studybridge"] }, async (_req, ctx) => {

  const supabase = ctx.supabaseAdmin;



  try {

   // --------------------------------------------------

   // 1. Find requested task or next pending task

   // --------------------------------------------------



   let requestedTaskId: number | null = null;



   let body: any = null;



   try {

       body = await _req.json();

   } catch {

       // No JSON body supplied; use the next pending task.

   }



   // --------------------------------------------------

   // Batch processing mode

   // Example:

   // {

   // "action": "process_pending",

   // "task_type": "verify_programme",

   // "limit": 15

   // }

   // --------------------------------------------------

if (body?.action === "process_pending") {

const taskType = body?.task_type ?? "verify_programme";

const parsedLimit = Number(body?.limit ?? 15);

const limit = Number.isInteger(parsedLimit)

    ? Math.min(Math.max(parsedLimit, 1), 15)

    : 15;



if (taskType === "verify_university") {
    return await processPendingUniversityVerifications(
        supabase,
        limit
    );
}

if (taskType === "discover_programmes") {
    return await processPendingProgrammeDiscoveries(
        supabase,
        limit
    );
}

if (taskType === "verify_programme") {

    return await processPendingProgrammeVerifications(

     supabase,

     limit

    );

}



if (taskType === "discover_admissions") {

    return await processPendingAdmissionDiscoveries(

     supabase,

     limit

    );

}



if (taskType === "verify_deadline") {

    return await processPendingDeadlineVerifications(

     supabase,

     limit

    );

}


if (taskType === "discover_scholarships") {

    return await processPendingScholarshipDiscoveries(

     supabase,

     limit

    );

}

if (taskType === "verify_scholarship") {
    return await processPendingScholarshipVerifications(
        supabase,
        limit
    );
}

if (taskType === "discover_phd_positions") {
    return await processPendingPhDDiscoveries(
        supabase,
        limit
    );
}

if (taskType === "verify_phd_position") {
    return await processPendingPhDVerifications(
        supabase,
        limit
    );
}

      return Response.json(

          {

              success: false,

     error: `Batch processing currently supports verify_university, discover_programmes, verify_programme,
discover_admissions, verify_deadline, discover_scholarships, verify_scholarship, discover_phd_positions and verify_phd_position. Received: ${taskType}`,

          },

          { status: 400 }

      );

  }



  if (body?.task_id !== undefined && body?.task_id !== null) {

      const parsedTaskId = Number(body.task_id);



      if (Number.isInteger(parsedTaskId)) {

          requestedTaskId = parsedTaskId;

      }

  }



  let taskQuery = supabase

      .from("research_queue")

      .select("*")

      .in("task_type", [

          "discover_universities",

          "verify_university",

          "discover_programmes",

          "verify_programme",

          "discover_admissions",

          "discover_scholarships",
          "verify_scholarship",
          "discover_phd_positions",
          "verify_phd_position",

     "verify_deadline",

    ])

    .eq("status", "pending");



if (requestedTaskId !== null) {

    taskQuery = taskQuery.eq("id", requestedTaskId);

} else {

    taskQuery = taskQuery

     .order("priority", { ascending: true })

     .order("created_at", { ascending: true });

}



const { data: task, error: taskError } = await taskQuery

    .limit(1)

    .maybeSingle();



if (taskError) {

    throw new Error(`Queue lookup failed: ${taskError.message}`);

}



if (!task) {

    return Response.json({

     success: false,

     message:

         requestedTaskId !== null

          ? `Task ${requestedTaskId} was not found or is not pending.`

          : "No pending research tasks.",

    });

}



// --------------------------------------------------

// 2. Get country

// --------------------------------------------------



const { data: country, error: countryError } = await supabase

    .from("countries")

    .select("*")

    .eq("id", task.country_id)

    .single();



if (countryError) {

    throw new Error(

     `Country lookup failed: ${countryError.message}`

    );

}



// --------------------------------------------------

// 3. Get source

// --------------------------------------------------



let source = null;



if (task.source_id) {

    const { data, error } = await supabase

     .from("sources")

     .select("*")

        .eq("id", task.source_id)

        .single();



    if (error) {

        throw new Error(

         `Source lookup failed: ${error.message}`

        );

    }



    source = data;

}



// ==================================================

// DISCOVERY WORKFLOW

// ==================================================



if (task.task_type === "discover_universities") {

    return await runUniversityDiscovery(

        supabase,

        task,

        country,

        source

    );

}



// ==================================================

// VERIFICATION WORKFLOW

// ==================================================

if (task.task_type === "verify_university") {

    return await runUniversityVerification(

     supabase,

     task,

     country,

     source

    );

}



// ==================================================

// PROGRAMME DISCOVERY WORKFLOW

// ==================================================



if (task.task_type === "discover_programmes") {

    return await runProgrammeDiscovery(

     supabase,

     task,

     country,

     source

    );

}



// ==================================================

// ADMISSIONS DISCOVERY WORKFLOW

// ==================================================



if (task.task_type === "discover_admissions") {

    return await runAdmissionDiscovery(

     supabase,

     task,

     country,

     source

    );

}



// ==================================================

// SCHOLARSHIP DISCOVERY WORKFLOW

// ==================================================



if (task.task_type === "discover_scholarships") {

    return await runScholarshipDiscovery(

     supabase,

     task,

     country,

     source

    );

}

// ==================================================
// PHD / FUNDED RESEARCH POSITION DISCOVERY WORKFLOW
// ==================================================

if (task.task_type === "discover_phd_positions") {
    return await runPhDPositionDiscovery(
        supabase,
        task,
        country,
        source
    );
}



// ==================================================
// PHD / FUNDED RESEARCH POSITION VERIFICATION WORKFLOW
// ==================================================

if (task.task_type === "verify_phd_position") {
    return await runPhDPositionVerification(
        supabase,
        task,
        country,
        source
    );
}

// ==================================================

// PROGRAMME VERIFICATION WORKFLOW

// ==================================================



if (task.task_type === "verify_programme") {

    return await runProgrammeVerification(

     supabase,

     task,

     country,

     source

    );

}



// ==================================================
// SCHOLARSHIP VERIFICATION WORKFLOW
// ==================================================

if (task.task_type === "verify_scholarship") {
    return await runScholarshipVerification(
        supabase,
        task,
        country,
        source
    );
}

// ==================================================

// DEADLINE VERIFICATION WORKFLOW

// ==================================================



if (task.task_type === "verify_deadline") {

    return await runDeadlineVerification(

     supabase,

                 task,

                 country,

                 source

             );

         }



         throw new Error(

             `Unsupported task type: ${task.task_type}`

         );

     } catch (error) {

         console.error("Research agent error:", error);



         return Response.json(

             {

                 success: false,

                 error:

                  error instanceof Error

                   ? error.message

                   : String(error),

             },

             { status: 500 }

         );

     }

 }),

};



// ======================================================
// BATCH UNIVERSITY VERIFICATION
// ======================================================

async function processPendingUniversityVerifications(
    supabase: any,
    limit: number
) {
    const { data: tasks, error: tasksError } = await supabase
        .from("research_queue")
        .select("*")
        .eq("task_type", "verify_university")
        .eq("status", "pending")
        .order("priority", { ascending: true })
        .order("id", { ascending: true })
        .limit(limit);

    if (tasksError) {
        throw new Error(`University batch queue lookup failed: ${tasksError.message}`);
    }

    if (!tasks || tasks.length === 0) {
        return Response.json({
            success: true,
            action: "process_pending",
            task_type: "verify_university",
            requested_limit: limit,
            selected: 0,
            processed: 0,
            succeeded: 0,
            failed: 0,
            results: [],
            message: "No pending university verification tasks.",
        });
    }

    const processOne = async (task: any) => {
        try {
            const { data: country, error: countryError } = await supabase
                .from("countries")
                .select("*")
                .eq("id", task.country_id)
                .single();

            if (countryError) {
                throw new Error(`Country lookup failed: ${countryError.message}`);
            }

            let source = null;
            if (task.source_id) {
                const { data, error } = await supabase
                    .from("sources")
                    .select("*")
                    .eq("id", task.source_id)
                    .single();

                if (error) {
                    throw new Error(`Source lookup failed: ${error.message}`);
                }
                source = data;
            }

            const response = await runUniversityVerification(
                supabase,
                task,
                country,
                source
            );

            if (!response.ok) {
                throw new Error(`University verification returned HTTP ${response.status}`);
            }

            return {
                task_id: task.id,
                success: true,
                status_code: response.status,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`Batch university verification failed for task ${task?.id ?? "unknown"}:`, error);

            if (task?.id) {
                await supabase
                    .from("research_queue")
                    .update({
                        status: "pending",
                        error_message: message,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", task.id);
            }

            return {
                task_id: task?.id ?? null,
                success: false,
                status_code: 500,
                error: message,
            };
        }
    };

    // Run selected university verifications concurrently to reduce request timeout risk.
    const settled = await Promise.allSettled(
        tasks.map((task: any) => processOne(task))
    );

    const results = settled.map((item, index) => {
        if (item.status === "fulfilled") return item.value;
        const reason = item.reason instanceof Error ? item.reason.message : String(item.reason);
        return {
            task_id: tasks[index]?.id ?? null,
            success: false,
            status_code: 500,
            error: reason,
        };
    });

    const succeeded = results.filter((item: any) => item?.success === true).length;
    const failed = results.length - succeeded;

    return Response.json({
        success: failed === 0,
        action: "process_pending",
        task_type: "verify_university",
        requested_limit: limit,
        selected: tasks.length,
        processed: results.length,
        succeeded,
        failed,
        results,
    });
}

// ======================================================
// BATCH PROGRAMME DISCOVERY
// ======================================================

async function processPendingProgrammeDiscoveries(
    supabase: any,
    limit: number
) {
    const { data: tasks, error: tasksError } = await supabase
        .from("research_queue")
        .select("*")
        .eq("task_type", "discover_programmes")
        .eq("status", "pending")
        .order("priority", { ascending: true })
        .order("id", { ascending: true })
        .limit(limit);

    if (tasksError) {
        throw new Error(
            `Programme discovery batch queue lookup failed: ${tasksError.message}`
        );
    }

    if (!tasks || tasks.length === 0) {
        return Response.json({
            success: true,
            action: "process_pending",
            task_type: "discover_programmes",
            requested_limit: limit,
            selected: 0,
            processed: 0,
            succeeded: 0,
            failed: 0,
            results: [],
            message: "No pending programme discovery tasks.",
        });
    }

    const processOne = async (task: any) => {
        try {
            const { data: country, error: countryError } = await supabase
                .from("countries")
                .select("*")
                .eq("id", task.country_id)
                .single();

            if (countryError) {
                throw new Error(`Country lookup failed: ${countryError.message}`);
            }

            let source = null;

            if (task.source_id) {
                const { data, error } = await supabase
                    .from("sources")
                    .select("*")
                    .eq("id", task.source_id)
                    .single();

                if (error) {
                    throw new Error(`Source lookup failed: ${error.message}`);
                }

                source = data;
            }

            const response = await runProgrammeDiscovery(
                supabase,
                task,
                country,
                source
            );

            if (!response.ok) {
                throw new Error(
                    `Programme discovery returned HTTP ${response.status}`
                );
            }

            return {
                task_id: task.id,
                success: true,
                status_code: response.status,
            };
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);

            console.error(
                `Batch programme discovery failed for task ${task?.id ?? "unknown"}:`,
                error
            );

            if (task?.id) {
                await supabase
                    .from("research_queue")
                    .update({
                        status: "pending",
                        error_message: message,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", task.id);
            }

            return {
                task_id: task?.id ?? null,
                success: false,
                status_code: 500,
                error: message,
            };
        }
    };

    // Programme discovery uses OpenAI web search and may take a long time.
    // Run the selected tasks concurrently, matching the proven university
    // verification batch pattern, so the HTTP request is less likely to hit
    // the Edge Function lifetime limit.
    const settled = await Promise.allSettled(
        tasks.map((task: any) => processOne(task))
    );

    const results = settled.map((item, index) => {
        if (item.status === "fulfilled") return item.value;

        const reason =
            item.reason instanceof Error
                ? item.reason.message
                : String(item.reason);

        return {
            task_id: tasks[index]?.id ?? null,
            success: false,
            status_code: 500,
            error: reason,
        };
    });

    const succeeded = results.filter(
        (item: any) => item?.success === true
    ).length;

    const failed = results.length - succeeded;

    return Response.json({
        success: failed === 0,
        action: "process_pending",
        task_type: "discover_programmes",
        requested_limit: limit,
        selected: tasks.length,
        processed: results.length,
        succeeded,
        failed,
        results,
    });
}

// ======================================================

// BATCH PROGRAMME VERIFICATION

// ======================================================



async function processPendingProgrammeVerifications(

 supabase: any,

 limit: number

){

 const { data: tasks, error: tasksError } = await supabase

     .from("research_queue")

     .select("*")

     .eq("task_type", "verify_programme")

     .eq("status", "pending")

     .order("priority", { ascending: true })

     .order("id", { ascending: true })

     .limit(limit);



 if (tasksError) {

     throw new Error(

      `Batch queue lookup failed: ${tasksError.message}`

     );

 }



 if (!tasks || tasks.length === 0) {

     return Response.json({

      success: true,

      action: "process_pending",

      task_type: "verify_programme",

      requested_limit: limit,

      selected: 0,

     processed: 0,

     succeeded: 0,

     failed: 0,

     results: [],

     message: "No pending programme verification tasks.",

    });

}



const results: any[] = [];



// Process one task at a time to reduce rate-limit risk.

for (const task of tasks) {

    try {

     const { data: country, error: countryError } = await supabase

         .from("countries")

         .select("*")

         .eq("id", task.country_id)

         .single();



     if (countryError) {

         throw new Error(

          `Country lookup failed: ${countryError.message}`

         );

     }



     let source = null;



     if (task.source_id) {

    const { data, error } = await supabase

        .from("sources")

        .select("*")

        .eq("id", task.source_id)

        .single();



    if (error) {

        throw new Error(

         `Source lookup failed: ${error.message}`

        );

    }



    source = data;

}



// The existing verification function performs the actual

// verification and all database/audit updates.

const response = await runProgrammeVerification(

    supabase,

    task,

    country,

    source

);



// Do not clone or parse the Response body here.

if (!response.ok) {

    results.push({

        task_id: task.id,

      success: false,

      status_code: response.status,

      error: `Programme verification returned HTTP ${response.status}`,

     });

 } else {

     results.push({

      task_id: task.id,

      success: true,

      status_code: response.status,

     });

 }

} catch (error) {

 const message =

     error instanceof Error ? error.message : String(error);



 console.error(

     `Batch programme verification failed for task ${task.id}:`,

     error

 );



 await supabase

     .from("research_queue")

     .update({

      status: "pending",

      error_message: message,

      updated_at: new Date().toISOString(),

     })

     .eq("id", task.id);

            results.push({

             task_id: task.id,

             success: false,

             error: message,

            });

        }

    }



    const succeeded = results.filter((item) => item.success).length;

    const failed = results.length - succeeded;



    return Response.json({

        success: true,

        action: "process_pending",

        task_type: "verify_programme",

        requested_limit: limit,

        selected: tasks.length,

        processed: results.length,

        succeeded,

        failed,

        results,

    });

}



// ======================================================

// BATCH SCHOLARSHIP DISCOVERY

// ======================================================



async function processPendingScholarshipDiscoveries(

 supabase: any,

 limit: number

){

 const queueLookup = await supabase

     .from("research_queue")

     .select("*")

     .eq("task_type", "discover_scholarships")

     .eq("status", "pending")

     .order("priority", { ascending: true })

     .order("id", { ascending: true })

     .limit(limit);



 if (!queueLookup) {

     throw new Error("Scholarship batch queue lookup returned no response");

 }



 const { data: tasks, error: tasksError } = queueLookup;



 if (tasksError) {

     throw new Error(

      `Scholarship batch queue lookup failed: ${tasksError.message}`

     );

 }



 if (!tasks || tasks.length === 0) {

     return Response.json({

      success: true,

      action: "process_pending",

      task_type: "discover_scholarships",

      requested_limit: limit,

      selected: 0,

      processed: 0,

      succeeded: 0,

      failed: 0,

      results: [],

      message: "No pending scholarship discovery tasks.",

     });

 }



 const results: any[] = [];



 // Process sequentially to reduce OpenAI rate-limit and runtime pressure.

 for (const task of tasks) {

     try {

         const countryLookup = await supabase

             .from("countries")

             .select("*")

             .eq("id", task.country_id)

             .single();



         if (!countryLookup) {

             throw new Error("Country lookup returned no response");

         }



         const { data: country, error: countryError } = countryLookup;



         if (countryError) {

             throw new Error(`Country lookup failed: ${countryError.message}`);

         }



         let source = null;



         if (task.source_id) {

             const sourceLookup = await supabase

                 .from("sources")

                 .select("*")

                 .eq("id", task.source_id)

                 .single();



             if (!sourceLookup) {

                 throw new Error("Source lookup returned no response");

             }



             const { data, error } = sourceLookup;



             if (error) {

                 throw new Error(`Source lookup failed: ${error.message}`);

             }



             source = data;

         }



         const response = await runScholarshipDiscovery(

             supabase,

             task,

             country,

             source

         );



         if (!response.ok) {

             results.push({

                 task_id: task.id,

                 success: false,

                 status_code: response.status,

                 error: `Scholarship discovery returned HTTP ${response.status}`,

             });

         } else {

             results.push({

                 task_id: task.id,

                 success: true,

                 status_code: response.status,

             });

         }

     } catch (error) {

         const message = error instanceof Error ? error.message : String(error);



         console.error(

             `Batch scholarship discovery failed for task ${task.id}:`,

             error

         );



         await supabase

             .from("research_queue")

             .update({

                 status: "pending",

                 error_message: message,

                 updated_at: new Date().toISOString(),

             })

             .eq("id", task.id);



         results.push({

             task_id: task.id,

             success: false,

             error: message,

         });

     }

 }



 const succeeded = results.filter((item) => item.success).length;

 const failed = results.length - succeeded;



 return Response.json({

     success: failed === 0,

     action: "process_pending",

     task_type: "discover_scholarships",

     requested_limit: limit,

     selected: tasks.length,

     processed: results.length,

     succeeded,

     failed,

     results,

 });

}



// ======================================================
// BATCH SCHOLARSHIP VERIFICATION
// ======================================================

async function processPendingScholarshipVerifications(
    supabase: any,
    limit: number
) {
    // Scholarship verification uses OpenAI web search and can take a while.
    // Running several tasks sequentially can exceed the Edge Function request
    // lifetime even though the database work itself succeeds. Select the batch
    // normally, then run the selected tasks concurrently so the HTTP request can
    // finish before the runtime deadline.
    let queueLookup: any;

    try {
        queueLookup = await supabase
            .from("research_queue")
            .select("*")
            .eq("task_type", "verify_scholarship")
            .eq("status", "pending")
            .order("priority", { ascending: true })
            .order("id", { ascending: true })
            .limit(limit);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return Response.json({
            success: false,
            action: "process_pending",
            task_type: "verify_scholarship",
            error: `Scholarship verification queue lookup exception: ${message}`,
        }, { status: 500 });
    }

    if (queueLookup == null) {
        return Response.json({
            success: false,
            action: "process_pending",
            task_type: "verify_scholarship",
            error: "Scholarship verification queue lookup returned no response object.",
        }, { status: 500 });
    }

    if (queueLookup.error) {
        return Response.json({
            success: false,
            action: "process_pending",
            task_type: "verify_scholarship",
            error: `Scholarship verification queue lookup failed: ${queueLookup.error?.message ?? String(queueLookup.error)}`,
        }, { status: 500 });
    }

    const tasks = Array.isArray(queueLookup.data) ? queueLookup.data : [];

    if (tasks.length === 0) {
        return Response.json({
            success: true,
            action: "process_pending",
            task_type: "verify_scholarship",
            requested_limit: limit,
            selected: 0,
            processed: 0,
            succeeded: 0,
            failed: 0,
            results: [],
            message: "No pending scholarship verification tasks.",
        });
    }

    const processOne = async (task: any) => {
        try {
            if (!task?.id) throw new Error("Selected scholarship verification task has no id.");
            if (!task.country_id) throw new Error(`Scholarship verification task ${task.id} has no country_id.`);

            let countryLookup: any;
            try {
                countryLookup = await supabase
                    .from("countries")
                    .select("*")
                    .eq("id", task.country_id)
                    .single();
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                throw new Error(`Country lookup exception for task ${task.id}: ${message}`);
            }

            if (countryLookup == null) throw new Error(`Country lookup returned no response for task ${task.id}.`);
            if (countryLookup.error) throw new Error(`Country lookup failed for task ${task.id}: ${countryLookup.error?.message ?? String(countryLookup.error)}`);
            if (!countryLookup.data) throw new Error(`Country ${task.country_id} was not found for task ${task.id}.`);

            let source = null;
            if (task.source_id) {
                let sourceLookup: any;
                try {
                    sourceLookup = await supabase
                        .from("sources")
                        .select("*")
                        .eq("id", task.source_id)
                        .single();
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    throw new Error(`Source lookup exception for task ${task.id}: ${message}`);
                }

                if (sourceLookup == null) throw new Error(`Source lookup returned no response for task ${task.id}.`);
                if (sourceLookup.error) throw new Error(`Source lookup failed for task ${task.id}: ${sourceLookup.error?.message ?? String(sourceLookup.error)}`);
                source = sourceLookup.data ?? null;
            }

            let response: Response | null = null;
            try {
                response = await runScholarshipVerification(
                    supabase,
                    task,
                    countryLookup.data,
                    source
                );
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                throw new Error(`Scholarship verification failed for task ${task.id}: ${message}`);
            }

            if (response == null) throw new Error(`Scholarship verification returned no response for task ${task.id}.`);

            const statusCode = Number(response.status);
            if (!Number.isFinite(statusCode) || statusCode < 200 || statusCode >= 300) {
                throw new Error(`Scholarship verification returned HTTP ${Number.isFinite(statusCode) ? statusCode : "unknown"} for task ${task.id}.`);
            }

            return { task_id: task.id, success: true, status_code: statusCode };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`Batch scholarship verification failed for task ${task?.id ?? "unknown"}:`, error);

            if (task?.id) {
                try {
                    const resetResult = await supabase
                        .from("research_queue")
                        .update({
                            status: "pending",
                            error_message: message,
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", task.id);
                    if (resetResult?.error) {
                        console.error(`Could not reset failed scholarship verification task ${task.id}:`, resetResult.error.message);
                    }
                } catch (resetError) {
                    console.error(`Could not reset failed scholarship verification task ${task.id}:`, resetError);
                }
            }

            return { task_id: task?.id ?? null, success: false, status_code: 500, error: message };
        }
    };

    // Process the selected tasks in parallel. This fixes the batch request timing
    // out after the underlying tasks have already completed.
    const settled = await Promise.allSettled(tasks.map((task: any) => processOne(task)));

    const results = settled.map((item, index) => {
        if (item.status === "fulfilled") return item.value;
        const reason = item.reason instanceof Error ? item.reason.message : String(item.reason);
        return {
            task_id: tasks[index]?.id ?? null,
            success: false,
            status_code: 500,
            error: reason,
        };
    });

    const succeeded = results.filter((item: any) => item?.success === true).length;
    const failed = results.length - succeeded;

    return Response.json({
        success: failed === 0,
        action: "process_pending",
        task_type: "verify_scholarship",
        requested_limit: limit,
        selected: tasks.length,
        processed: results.length,
        succeeded,
        failed,
        results,
    });
}

// ======================================================

// UNIVERSITY DISCOVERY

// ======================================================

async function runUniversityDiscovery(

 supabase: any,

 task: any,

 country: any,

 source: any

){

 // --------------------------------------------------

 // Get discovery agent configuration

 // --------------------------------------------------



 const { data: agentConfig, error: configError } =

     await supabase

      .from("ai_agent_configs")

      .select("*")

      .eq("agent_name", "university_discovery_agent")

      .eq("active", true)

      .single();



 if (configError) {

     throw new Error(

      `AI agent configuration lookup failed: ${configError.message}`

     );

 }



 // --------------------------------------------------

 // Mark task as processing

 // --------------------------------------------------

const { error: processingError } = await supabase

    .from("research_queue")

    .update({

     status: "processing",

     attempts: (task.attempts ?? 0) + 1,

     last_attempt_at: new Date().toISOString(),

     updated_at: new Date().toISOString(),

    })

    .eq("id", task.id);



if (processingError) {

    throw new Error(

     `Could not mark task as processing: ${processingError.message}`

    );

}



// --------------------------------------------------

// Create agent run

// --------------------------------------------------



const { data: agentRun, error: runError } =

    await supabase

     .from("agent_runs")

     .insert({

         research_queue_id: task.id,

         agent_name: "university_discovery_agent",

         run_type: "university_discovery",

         status: "running",

        })

        .select()

        .single();



if (runError) {

    throw new Error(

        `Agent run creation failed: ${runError.message}`

    );

}



// --------------------------------------------------

// Source domain

// --------------------------------------------------



let allowedDomain: string | null = null;



if (source?.url) {

    try {

        allowedDomain = new URL(source.url).hostname;

    } catch {

        allowedDomain = null;

    }

}



// --------------------------------------------------

// Prompt

// --------------------------------------------------

 const userPrompt = `

Research universities in ${country.name} (${country.code}).



Official starting source:

${source?.name ?? "Official source"}

${source?.url ?? "No source URL provided"}



Your task is UNIVERSITY DISCOVERY ONLY.



Find universities or higher-education institutions that can be added to our international
student database.



Do NOT invent institutions.



Prefer official university websites and official government/admissions sources.



For every institution you find, return:



- official university name

- official website

- official admissions URL if available

- official international-student URL if available

- city

- institution type

- country

- the exact official source URL where you confirmed the institution

- short factual summary

- confidence score from 0 to 1



Important:

- Do not guess missing information.

- If a URL is not available, return an empty string.

- Do not include tuition fees.

- Do not include programmes.

- Do not include scholarships.

- Do not include application deadlines.

- Do not treat a search result snippet as sufficient evidence when an official page is
available.

- Avoid duplicates.

- Only return institutions that you can reasonably confirm from an official source.

`;



 const webSearchTool: Record<string, unknown> = {

     type: "web_search",

     search_context_size: "high",

 };



 if (allowedDomain) {

     webSearchTool.filters = {

      allowed_domains: [allowedDomain],

     };

 }



 // --------------------------------------------------

 // OpenAI request

// --------------------------------------------------



const openAIResponse = await fetch(

 "https://api.openai.com/v1/responses",

 {

     method: "POST",

     headers: {

      "Content-Type": "application/json",

      Authorization: `Bearer ${OPENAI_API_KEY}`,

     },

     body: JSON.stringify({

      model: "gpt-5.6-luna",



      tools: [webSearchTool],



      tool_choice: "required",



      input: [

          {

              role: "system",

              content: agentConfig.system_instructions,

          },

          {

              role: "user",

              content: userPrompt,

          },

      ],

text: {

 format: {

  type: "json_schema",

  name: "university_discovery",

  strict: true,

  schema: {

   type: "object",

   properties: {

    universities: {

     type: "array",

     items: {

          type: "object",

          properties: {

           name: { type: "string" },

           official_website: { type: "string" },

           admissions_url: { type: "string" },

           international_url: { type: "string" },

           city: { type: "string" },

           university_type: { type: "string" },

           country: { type: "string" },

           source_url: { type: "string" },

           summary: { type: "string" },

           confidence_score: { type: "number" },

          },

          required: [

           "name",

           "official_website",

           "admissions_url",

                         "international_url",

                         "city",

                         "university_type",

                         "country",

                         "source_url",

                         "summary",

                         "confidence_score",

                        ],

                        additionalProperties: false,

                    },

                   },

               },

               required: ["universities"],

               additionalProperties: false,

              },

          },

         },

        }),

    }

);



if (!openAIResponse.ok) {

    const errorText = await openAIResponse.text();



    throw new Error(

        `OpenAI API error ${openAIResponse.status}: ${errorText}`

    );

}

const openAIData = await openAIResponse.json();



// --------------------------------------------------

// Extract output

// --------------------------------------------------



const outputText =

    openAIData.output

     ?.find((item: any) => item.type === "message")

     ?.content

     ?.find((item: any) => item.type === "output_text")

     ?.text;



if (!outputText) {

    throw new Error(

     `OpenAI returned no output text. Raw response: ${JSON.stringify(

         openAIData

     )}`

    );

}



let researchResult: DiscoveryResponse;



try {

    researchResult = JSON.parse(outputText);

} catch {

    throw new Error(

     `Could not parse OpenAI structured output: ${outputText}`

    );

}



const universities = researchResult.universities ?? [];



// --------------------------------------------------

// Save results

// --------------------------------------------------



let resultsSaved = 0;



for (const university of universities) {

    const { error: insertError } = await supabase

     .from("research_results")

     .insert({

         research_queue_id: task.id,

         country_id: task.country_id,

         university_id: null,

         source_id: task.source_id,

         entity_type: "university",

         name: university.name,

         source_url: university.source_url,

         official_source: true,

         extracted_data: university,

         ai_summary: university.summary,

         verification_status: "pending",

         confidence_score: university.confidence_score,

        });



    if (insertError) {

        console.error(

         `Failed to save ${university.name}:`,

         insertError.message

        );

        continue;

    }



    resultsSaved++;

}



// --------------------------------------------------

// Complete task

// --------------------------------------------------



await supabase

    .from("research_queue")

    .update({

        status: "completed",

        updated_at: new Date().toISOString(),

        error_message: null,

    })

    .eq("id", task.id);



// --------------------------------------------------

// Complete agent run

    // --------------------------------------------------



    await supabase

     .from("agent_runs")

     .update({

      status: "completed",

      completed_at: new Date().toISOString(),

      results_found: universities.length,

      results_verified: 0,

  notes: `Saved ${resultsSaved} university discovery results. Verification is still
pending.`,

     })

     .eq("id", agentRun.id);



    return Response.json({

     success: true,

     task_id: task.id,

     agent_run_id: agentRun.id,

     task_type: "discover_universities",

     country: country.name,

     source: source?.name ?? null,

     results_found: universities.length,

     results_saved: resultsSaved,

     results_updated: 0,

     verification_status: "pending",

    });

}

// ======================================================

// UNIVERSITY VERIFICATION

// ======================================================



async function runUniversityVerification(

 supabase: any,

 task: any,

 country: any,

 source: any

){

 // --------------------------------------------------

 // Get verification agent configuration

 // --------------------------------------------------



 const { data: agentConfig, error: configError } =

     await supabase

      .from("ai_agent_configs")

      .select("*")

      .eq("agent_name", "university_verification_agent")

      .eq("active", true)

      .single();



 if (configError) {

     throw new Error(

      `Verification agent configuration lookup failed: ${configError.message}`

     );

 }

// --------------------------------------------------

// Get research result

// --------------------------------------------------



if (!task.research_result_id) {

    throw new Error(

     `Verification task ${task.id} has no research_result_id`

    );

}



const { data: researchResult, error: resultError } =

    await supabase

     .from("research_results")

     .select("*")

     .eq("id", task.research_result_id)

     .single();



if (resultError) {

    throw new Error(

     `Research result lookup failed: ${resultError.message}`

    );

}



// --------------------------------------------------

// Mark task as processing

// --------------------------------------------------



const { error: processingError } = await supabase

    .from("research_queue")

    .update({

     status: "processing",

     attempts: (task.attempts ?? 0) + 1,

     last_attempt_at: new Date().toISOString(),

     updated_at: new Date().toISOString(),

    })

    .eq("id", task.id);



if (processingError) {

    throw new Error(

     `Could not mark verification task as processing: ${processingError.message}`

    );

}



// --------------------------------------------------

// Create agent run

// --------------------------------------------------



const { data: agentRun, error: runError } =

    await supabase

     .from("agent_runs")

     .insert({

         research_queue_id: task.id,

         agent_name: "university_verification_agent",

         run_type: "university_verification",

         status: "running",

     })

     .select()

     .single();



if (runError) {

    throw new Error(

     `Verification agent run creation failed: ${runError.message}`

    );

}



// --------------------------------------------------

// Original discovery information

// --------------------------------------------------



const discoveredData =

    researchResult.extracted_data ?? {};



const discoveredName =

    researchResult.name ?? discoveredData.name ?? "";



const discoveredSourceUrl =

    researchResult.source_url ??

    discoveredData.source_url ??

    "";



// --------------------------------------------------

// Verification prompt

// --------------------------------------------------

 const userPrompt = `

Verify this previously discovered university.



Country:

${country.name} (${country.code})



University discovered:

${discoveredName}



Original discovery source:

${discoveredSourceUrl}



Original discovery data:

${JSON.stringify(discoveredData)}



Your task is UNIVERSITY VERIFICATION ONLY.



Find the university's official website and verify its identity.



You must specifically try to find:



- official university website

- official admissions/application URL if available

- official international-student URL if available

- city

- correct university_type

- country

- official source URL used for verification

Important rules:



- Prefer the university's own official website.

- Government or official national education sources may be used as supporting
evidence.

- Do not invent URLs.

- Do not guess missing information.

- If an official website cannot be confirmed, leave it blank.

- If admissions or international URLs cannot be confirmed, leave them blank.

- Do not discover programmes.

- Do not discover scholarships.

- Do not discover deadlines.

- Do not discover PhD positions.

- Do not use "Public" or "Private" as university_type.

- university_type must be one of:

 University

 University of Applied Sciences

 College

 Institute

 Research Institute

 Other



Verification status must be:



verified:

The university identity and official institutional website can be confidently confirmed.

needs_review:

There is evidence the institution exists, but important identity or official-source
information cannot be confidently confirmed.



rejected:

The discovered institution cannot be reliably confirmed or appears to be
incorrect/duplicate.



Return factual verification notes explaining the evidence.

`;



// --------------------------------------------------

// Web search

// --------------------------------------------------



const webSearchTool: Record<string, unknown> = {

 type: "web_search",

 search_context_size: "medium",

};



// IMPORTANT:

// Do NOT restrict verification to the national source domain.

// The verification agent needs to search the university's

// own official website.



// --------------------------------------------------

// OpenAI request

// --------------------------------------------------

const openAIResponse = await fetch(

"https://api.openai.com/v1/responses",

{

    method: "POST",

    headers: {

     "Content-Type": "application/json",

     Authorization: `Bearer ${OPENAI_API_KEY}`,

    },

    body: JSON.stringify({

     model: "gpt-5.6-luna",



     tools: [webSearchTool],



     tool_choice: "required",



     input: [

         {

             role: "system",

             content: agentConfig.system_instructions,

         },

         {

             role: "user",

             content: userPrompt,

         },

     ],



     text: {

         format: {

type: "json_schema",

name: "university_verification",

strict: true,

schema: {

 type: "object",

 properties: {

  verification: {

   type: "object",

   properties: {

    name: { type: "string" },

    official_website: { type: "string" },

    admissions_url: { type: "string" },

    international_url: { type: "string" },

    city: { type: "string" },

    university_type: { type: "string" },

    country: { type: "string" },

    source_url: { type: "string" },

    summary: { type: "string" },

    confidence_score: { type: "number" },

    verification_status: {

     type: "string",

     enum: [

         "verified",

         "needs_review",

         "rejected",

     ],

    },

    verification_notes: {

                      type: "string",

                     },

                 },

                 required: [

                     "name",

                     "official_website",

                     "admissions_url",

                     "international_url",

                     "city",

                     "university_type",

                     "country",

                     "source_url",

                     "summary",

                     "confidence_score",

                     "verification_status",

                     "verification_notes",

                 ],

                 additionalProperties: false,

                },

            },

            required: ["verification"],

            additionalProperties: false,

           },

       },

      },

     }),

 }

);

if (!openAIResponse.ok) {

    const errorText = await openAIResponse.text();



    // Put task back into pending so a temporary API error

    // does not permanently strand the task.

    await supabase

     .from("research_queue")

     .update({

         status: "pending",

         error_message: errorText,

         updated_at: new Date().toISOString(),

     })

     .eq("id", task.id);



    await supabase

     .from("agent_runs")

     .update({

         status: "failed",

         completed_at: new Date().toISOString(),

         error_message: `OpenAI API error ${openAIResponse.status}: ${errorText}`,

     })

     .eq("id", agentRun.id);



    throw new Error(

     `OpenAI API error ${openAIResponse.status}: ${errorText}`

    );

}

const openAIData = await openAIResponse.json();



// --------------------------------------------------

// Extract structured output

// --------------------------------------------------



const outputText =

    openAIData.output

     ?.find((item: any) => item.type === "message")

     ?.content

     ?.find((item: any) => item.type === "output_text")

     ?.text;



if (!outputText) {

    throw new Error(

     `OpenAI returned no output text. Raw response: ${JSON.stringify(

         openAIData

     )}`

    );

}



let verificationResponse: VerificationResponse;



try {

    verificationResponse = JSON.parse(outputText);

} catch {

    throw new Error(

     `Could not parse verification output: ${outputText}`

    );

}



const verification = verificationResponse.verification;



// --------------------------------------------------

// Update research result

// --------------------------------------------------



const { error: updateResultError } = await supabase

    .from("research_results")

    .update({

     name: verification.name,

     source_url: verification.source_url,

     extracted_data: verification,

     ai_summary: verification.summary,

     verification_status: verification.verification_status,

     confidence_score: verification.confidence_score,

     verified_at:

         verification.verification_status === "verified"

         ? new Date().toISOString()

         : null,

     updated_at: new Date().toISOString(),

    })

    .eq("id", researchResult.id);



if (updateResultError) {

    throw new Error(

     `Failed to update research result: ${updateResultError.message}`

    );

}



// --------------------------------------------------

// Write verification log

// --------------------------------------------------



const { error: logError } = await supabase

    .from("verification_log")

    .insert({

     research_result_id: researchResult.id,

     verification_type: "official_source_check",

     result:

         verification.verification_status === "verified"

          ? "passed"

          : verification.verification_status === "needs_review"

          ? "needs_review"

          : "failed",

     checked_url:

         verification.official_website ||

         verification.source_url ||

         discoveredSourceUrl,

     evidence: verification.verification_notes,

     notes: verification.summary,

    });

if (logError) {

    console.error(

        "Verification log failed:",

        logError.message

    );

}



// --------------------------------------------------

// If verified, insert/update universities table

// --------------------------------------------------



let universityId: number | null = null;



if (verification.verification_status === "verified") {

    const { data: existingUniversity, error: existingError } =

        await supabase

         .from("universities")

         .select("id")

         .eq("country_id", task.country_id)

         .ilike("name", verification.name)

         .maybeSingle();



    if (existingError) {

        console.error(

         "Existing university lookup failed:",

         existingError.message

        );

    }

if (existingUniversity) {

 universityId = existingUniversity.id;



 const { error: universityUpdateError } =

  await supabase

   .from("universities")

   .update({

    city: verification.city || null,

    website_url:

        verification.official_website || null,

    admissions_url:

        verification.admissions_url || null,

    international_url:

        verification.international_url || null,

    description: verification.summary || null,

    university_type:

        verification.university_type || "Other",

    country_code: country.code,

    discovery_status: "verified",

    official_source_verified: true,

    last_source_check: new Date().toISOString(),

    last_verified: new Date().toISOString(),

    updated_at: new Date().toISOString(),

   })

   .eq("id", universityId);



 if (universityUpdateError) {

     throw new Error(

      `University update failed: ${universityUpdateError.message}`

     );

 }

} else {

 const { data: insertedUniversity, error: insertUniversityError } =

     await supabase

      .from("universities")

      .insert({

          country_id: task.country_id,

          name: verification.name,

          city: verification.city || null,

          website_url:

           verification.official_website || null,

          admissions_url:

           verification.admissions_url || null,

          international_url:

           verification.international_url || null,

          description: verification.summary || null,

          is_active: true,

          last_verified: new Date().toISOString(),

          university_type:

           verification.university_type || "Other",

          source_id: task.source_id,

          country_code: country.code,

          discovery_status: "verified",

          official_source_verified: true,

          last_source_check: new Date().toISOString(),

             })

             .select("id")

             .single();



        if (insertUniversityError) {

            throw new Error(

             `University insert failed: ${insertUniversityError.message}`

            );

        }



        universityId = insertedUniversity.id;

    }

}



// --------------------------------------------------

// Link research result to university

// --------------------------------------------------



if (universityId) {

    await supabase

        .from("research_results")

        .update({

            university_id: universityId,

            updated_at: new Date().toISOString(),

        })

        .eq("id", researchResult.id);

}

// --------------------------------------------------

// Complete queue task

// --------------------------------------------------



await supabase

 .from("research_queue")

 .update({

  status: "completed",

  updated_at: new Date().toISOString(),

  error_message: null,

 })

 .eq("id", task.id);



// --------------------------------------------------

// Complete agent run

// --------------------------------------------------



await supabase

 .from("agent_runs")

 .update({

  status: "completed",

  completed_at: new Date().toISOString(),

  results_found: 1,

  results_verified:

      verification.verification_status === "verified"

      ?1

      : 0,

  notes: `University verification status: ${verification.verification_status}.`,

     })

     .eq("id", agentRun.id);



    // --------------------------------------------------

    // Return result

    // --------------------------------------------------



    return Response.json({

     success: true,

     task_id: task.id,

     agent_run_id: agentRun.id,

     task_type: "verify_university",

     country: country.name,

     university_discovered: discoveredName,

     verified_name: verification.name,

     verification_status:

      verification.verification_status,

     official_website:

      verification.official_website,

     admissions_url:

      verification.admissions_url,

     international_url:

      verification.international_url,

     university_id: universityId,

     confidence_score:

      verification.confidence_score,

    });

}

// ======================================================

// PROGRAMME DISCOVERY

// ======================================================



async function runProgrammeDiscovery(

 supabase: any,

 task: any,

 country: any,

 source: any

){

 // --------------------------------------------------

 // Get programme discovery agent configuration

 // --------------------------------------------------



 const { data: agentConfig, error: configError } =

     await supabase

      .from("ai_agent_configs")

      .select("*")

      .eq("agent_name", "programme_discovery_agent")

      .eq("active", true)

      .single();



 if (configError) {

     throw new Error(

      `Programme discovery agent configuration lookup failed: ${configError.message}`

     );

 }

// --------------------------------------------------

// Get verified university

// --------------------------------------------------



if (!task.university_id) {

    throw new Error(

     `Programme discovery task ${task.id} has no university_id`

    );

}



const { data: university, error: universityError } =

    await supabase

     .from("universities")

     .select("*")

     .eq("id", task.university_id)

     .single();



if (universityError) {

    throw new Error(

     `University lookup failed: ${universityError.message}`

    );

}



if (!university.website_url) {

    throw new Error(

     `University ${university.id} has no official website URL`

    );

}



// --------------------------------------------------

// Mark task as processing

// --------------------------------------------------



const { error: processingError } = await supabase

    .from("research_queue")

    .update({

     status: "processing",

     attempts: (task.attempts ?? 0) + 1,

     last_attempt_at: new Date().toISOString(),

     updated_at: new Date().toISOString(),

    })

    .eq("id", task.id);



if (processingError) {

    throw new Error(

     `Could not mark programme task as processing: ${processingError.message}`

    );

}



// --------------------------------------------------

// Create agent run

// --------------------------------------------------



const { data: agentRun, error: runError } =

    await supabase

     .from("agent_runs")

     .insert({

         research_queue_id: task.id,

         agent_name: "programme_discovery_agent",

         run_type: "programme_discovery",

         status: "running",

     })

     .select()

     .single();



if (runError) {

    throw new Error(

     `Programme discovery agent run creation failed: ${runError.message}`

    );

}



// --------------------------------------------------

// Official source domains

// --------------------------------------------------

//

// Programme information may be published on the

// university website, admissions portal, or official

// international-student portal. Restrict search to

// official domains supplied by the verified record,

// rather than only the main university homepage domain.

// --------------------------------------------------



const allowedDomains = new Set<string>();

const addDomain = (url: string | null | undefined) => {

 if (!url) return;



 try {

     const hostname = new URL(url).hostname

         .toLowerCase()

         .replace(/^www\./, "");



     if (hostname) {

         allowedDomains.add(hostname);

     }

 } catch {

     // Ignore invalid URLs; the agent must not invent a domain.

 }

};



addDomain(university.website_url);

addDomain(university.admissions_url);

addDomain(university.international_url);



// Also include the official national source domain attached

// to this research task when it exists. This is allowed only

// as supporting official evidence, not as the primary source

// for programme identity when the university page is available.

addDomain(source?.url);



const officialDomains = Array.from(allowedDomains);

 // --------------------------------------------------

 // Prompt

 // --------------------------------------------------



 const userPrompt = `

Research academic programmes offered by this verified university.



Country:

${country.name} (${country.code})



University:

${university.name}



University type:

${university.university_type ?? ""}



Official university website:

${university.website_url}



Official admissions URL:

${university.admissions_url ?? ""}



Official international-student URL:

${university.international_url ?? ""}



Your task is PROGRAMME DISCOVERY ONLY.

Find actual academic programmes offered by this university.



Discover programmes across these degree levels where available:

- Foundation

- Bachelor

- Master

- PhD

- Postdoc

- Certificate

- Other



For every programme, return:

- official programme name

- degree level

- subject

- field

- description

- duration

- study mode

- teaching language

- tuition fee

- tuition currency

- international student information

- official programme URL

- official application URL if available

- exact official source URL used as evidence

- confidence score from 0 to 1

Important:

- Use the university's official website as the primary source.

- Also search the official admissions URL and official international-student URL
supplied above when programme information is not available on the main university
website.

- If an official national admissions/education portal is supplied as the research source,
it may be used as supporting evidence, but the university's own official programme page
should be preferred whenever available.

- Search across the official domains provided above; do not assume all programme
pages use the same domain as the university homepage.

- Prefer specific official programme pages over general university pages.

- Do not invent programmes.

- Do not invent fees, duration, language, eligibility, or URLs.

- If information is not published, return an empty string.

- Do not estimate tuition fees.

- Do not assume English-language teaching.

- Do not assume international-student eligibility.

- Do not include scholarship information.

- Do not include application deadlines.

- Do not include admissions opening/closing dates.

- Do not include specific PhD research vacancies; those belong to the PhD research-
position agent.

- Avoid duplicate programmes.

- Only return programmes that can reasonably be confirmed from an official source.

`;



 const webSearchTool: Record<string, unknown> = {

  type: "web_search",

  search_context_size: "medium",

 };

if (officialDomains.length > 0) {

    webSearchTool.filters = {

        allowed_domains: officialDomains,

    };

}



// --------------------------------------------------

// OpenAI request

// --------------------------------------------------



const openAIResponse = await fetch(

    "https://api.openai.com/v1/responses",

    {

        method: "POST",

        headers: {

         "Content-Type": "application/json",

         Authorization: `Bearer ${OPENAI_API_KEY}`,

        },

        body: JSON.stringify({

         model: "gpt-5.6-luna",

         tools: [webSearchTool],

         tool_choice: "required",

         input: [

             {

                 role: "system",

                 content: agentConfig.system_instructions,

             },

 {

     role: "user",

     content: userPrompt,

 },

],

text: {

 format: {

     type: "json_schema",

     name: "programme_discovery",

     strict: true,

     schema: {

      type: "object",

      properties: {

       programmes: {

        type: "array",

        items: {

          type: "object",

          properties: {

           name: { type: "string" },

           degree_level: { type: "string" },

           subject: { type: "string" },

           field: { type: "string" },

           description: { type: "string" },

           duration: { type: "string" },

           study_mode: { type: "string" },

           language: { type: "string" },

           tuition_fee: { type: "string" },

           tuition_currency: { type: "string" },

          international_students: { type: "string" },

          programme_url: { type: "string" },

          application_url: { type: "string" },

          source_url: { type: "string" },

          confidence_score: { type: "number" },

      },

      required: [

          "name",

          "degree_level",

          "subject",

          "field",

          "description",

          "duration",

          "study_mode",

          "language",

          "tuition_fee",

          "tuition_currency",

          "international_students",

          "programme_url",

          "application_url",

          "source_url",

          "confidence_score",

      ],

      additionalProperties: false,

     },

 },

},

required: ["programmes"],

               additionalProperties: false,

           },

          },

      },

     }),

 }

);



if (!openAIResponse.ok) {

 const errorText = await openAIResponse.text();



 await supabase

     .from("research_queue")

     .update({

      status: "pending",

      error_message: errorText,

      updated_at: new Date().toISOString(),

     })

     .eq("id", task.id);



 await supabase

     .from("agent_runs")

     .update({

      status: "failed",

      completed_at: new Date().toISOString(),

      error_message: `OpenAI API error ${openAIResponse.status}: ${errorText}`,

     })

     .eq("id", agentRun.id);

    throw new Error(

     `OpenAI API error ${openAIResponse.status}: ${errorText}`

    );

}



const openAIData = await openAIResponse.json();



// --------------------------------------------------

// Extract structured output

// --------------------------------------------------



const outputText =

    openAIData.output

     ?.find((item: any) => item.type === "message")

     ?.content

     ?.find((item: any) => item.type === "output_text")

     ?.text;



if (!outputText) {

    throw new Error(

     `OpenAI returned no output text. Raw response: ${JSON.stringify(

         openAIData

     )}`

    );

}



let programmeResponse: ProgrammeDiscoveryResponse;

try {

    programmeResponse = JSON.parse(outputText);

} catch {

    throw new Error(

     `Could not parse programme discovery output: ${outputText}`

    );

}



const programmes = programmeResponse.programmes ?? [];



// --------------------------------------------------

// Save or update programme results

// --------------------------------------------------



let resultsSaved = 0;

let resultsUpdated = 0;



for (const programme of programmes) {

    // Find an existing programme for the same university

    // using the programme name.

    const { data: existingProgramme, error: existingError } =

     await supabase

         .from("research_results")

         .select("id, extracted_data, verification_status")

         .eq("university_id", task.university_id)

         .eq("entity_type", "programme")

         .eq("name", programme.name)

     .limit(1)

     .maybeSingle();



if (existingError) {

    console.error(

     `Could not check existing programme ${programme.name}:`,

     existingError.message

    );

    continue;

}



// ------------------------------------------------

// UPDATE existing programme

// ------------------------------------------------



if (existingProgramme) {

    const existingData = existingProgramme.extracted_data ?? {};



    const mergedProgramme = {

     ...existingData,

     ...programme,

     programme_url:

         programme.programme_url ||

         existingData.programme_url ||

         "",

     application_url:

         programme.application_url ||

         existingData.application_url ||

     "",

 source_url:

     programme.source_url ||

     existingData.source_url ||

     "",

};



const { error: updateError } = await supabase

 .from("research_results")

 .update({

     research_queue_id: task.id,

     source_id: task.source_id ?? null,

     source_url:

      programme.source_url ||

      existingData.source_url ||

      null,

     official_source: true,

     extracted_data: mergedProgramme,

     ai_summary:

      programme.description ||

      existingData.description ||

      null,

     confidence_score:

      programme.confidence_score ??

      existingData.confidence_score ??

      null,

     updated_at: new Date().toISOString(),

 })

        .eq("id", existingProgramme.id);



    if (updateError) {

        console.error(

         `Failed to update programme ${programme.name}:`,

         updateError.message

        );

        continue;

    }



    resultsUpdated++;

    continue;

}



// ------------------------------------------------

// INSERT new programme

// ------------------------------------------------



const { error: insertError } = await supabase

    .from("research_results")

    .insert({

        research_queue_id: task.id,

        country_id: task.country_id,

        university_id: task.university_id,

        source_id: task.source_id ?? null,

        entity_type: "programme",

        name: programme.name,

        source_url: programme.source_url,

         official_source: true,

         extracted_data: programme,

         ai_summary: programme.description,

         verification_status: "pending",

         confidence_score: programme.confidence_score,

        });



    if (insertError) {

        console.error(

         `Failed to save programme ${programme.name}:`,

         insertError.message

        );

        continue;

    }



    resultsSaved++;

}



// --------------------------------------------------

// Complete queue task

// --------------------------------------------------



await supabase

    .from("research_queue")

    .update({

        status: "completed",

        updated_at: new Date().toISOString(),

        error_message: null,

 })

 .eq("id", task.id);



// --------------------------------------------------

// Complete agent run

// --------------------------------------------------



await supabase

 .from("agent_runs")

 .update({

  status: "completed",

  completed_at: new Date().toISOString(),

  results_found: programmes.length,

  results_verified: 0,

    notes: `Saved ${resultsSaved} programme discovery results. Programme verification
is still pending.`,

 })

 .eq("id", agentRun.id);



return Response.json({

 success: true,

 task_id: task.id,

 agent_run_id: agentRun.id,

 task_type: "discover_programmes",

 country: country.name,

 university: university.name,

 university_id: university.id,

 results_found: programmes.length,

        results_saved: resultsSaved,

        results_updated: resultsUpdated,

        verification_status: "pending",

    });

}




// ======================================================

// SCHOLARSHIP DISCOVERY

// ======================================================



async function runScholarshipDiscovery(

 supabase: any,

 task: any,

 country: any,

 source: any

){

 const configLookup = await supabase

     .from("ai_agent_configs")

     .select("*")

     .eq("agent_name", "scholarship_discovery_agent")

     .eq("active", true)

     .single();



 if (!configLookup) {

     throw new Error("Scholarship discovery agent configuration lookup returned no response");

 }



 const { data: agentConfig, error: configError } = configLookup;



 if (configError) {

     throw new Error(

      `Scholarship discovery agent configuration lookup failed: ${configError.message}`

     );

 }



 const processingUpdate = await supabase

     .from("research_queue")

     .update({

         status: "processing",

         attempts: (task.attempts ?? 0) + 1,

         last_attempt_at: new Date().toISOString(),

         updated_at: new Date().toISOString(),

     })

     .eq("id", task.id);



 if (!processingUpdate) {

     throw new Error("Could not mark scholarship task as processing: no response returned");

 }



 const { error: processingError } = processingUpdate;



 if (processingError) {

     throw new Error(

      `Could not mark scholarship task as processing: ${processingError.message}`

     );

 }



 const runInsert = await supabase

     .from("agent_runs")

     .insert({

         research_queue_id: task.id,

         agent_name: "scholarship_discovery_agent",

         run_type: "scholarship_discovery",

         status: "running",

     })

     .select()

     .single();



 if (!runInsert) {

     throw new Error("Scholarship discovery agent run creation returned no response");

 }



 const { data: agentRun, error: runError } = runInsert;



 if (runError) {

     await supabase

         .from("research_queue")

         .update({

             status: "pending",

             error_message: runError.message,

             updated_at: new Date().toISOString(),

         })

         .eq("id", task.id);



     throw new Error(

      `Scholarship discovery agent run creation failed: ${runError.message}`

     );

 }



 const failTask = async (message: string) => {

     await supabase

         .from("research_queue")

         .update({

             status: "pending",

             error_message: message,

             updated_at: new Date().toISOString(),

         })

         .eq("id", task.id);



     if (agentRun?.id) {

         await supabase

             .from("agent_runs")

             .update({

                 status: "failed",

                 completed_at: new Date().toISOString(),

                 error_message: message,

             })

             .eq("id", agentRun.id);

     }

 };



 const userPrompt = `
Research scholarships and official funding opportunities available to international students in ${country.name} (${country.code}).

Official starting source:
${source?.name ?? "Official source"}
${source?.url ?? "No source URL provided"}

Your task is SCHOLARSHIP DISCOVERY ONLY.

Use the starting source to discover relevant opportunities, and where appropriate follow official links to government departments, universities, recognised scholarship providers, foundations, research funders, or official admissions portals.

Prioritise scholarships for the current or next published application cycle. If an officially published opportunity is already expired, it may still be returned but must be marked closed.

For every scholarship or funding opportunity, return:
- exact official scholarship name
- provider
- country
- applicable degree level
- eligible field or subject when stated
- short factual description
- funding type
- funding amount only when officially published
- original currency
- eligibility requirements, including nationality restrictions when stated
- application opening date when explicitly published
- application deadline when explicitly published
- exact official scholarship source URL
- exact official application URL when available
- status: upcoming, open, closed, or unknown
- confidence score from 0 to 1
- short notes about missing, unclear, or conflicting information

Important rules:
- Use official government, university, scholarship-provider, foundation, or recognised official education sources as evidence.
- Do not use commercial scholarship-listing sites as final evidence.
- Do not invent names, amounts, dates, eligibility, nationality rules, degree levels, fields, currencies, or URLs.
- If a value is not officially published, return an empty string.
- Do not assume a scholarship is open to all international students.
- Distinguish Fully Funded, Full Tuition, Partial Tuition, Stipend, Research Funding, and Other accurately.
- Do not convert currencies or estimate monetary values.
- Do not include ordinary academic programmes.
- Do not include general admission deadlines unless they are explicitly part of the scholarship application.
- Do not include individual PhD job vacancies or research employment posts; those belong to the PhD research-position agent.
- Avoid duplicate scholarship records.
- Prefer the most specific official scholarship page over a general homepage.
- A confidence score of 0.90 or higher should only be used when the scholarship identity and key eligibility/deadline details are clearly supported by official sources.
`;



 const webSearchTool: Record<string, unknown> = {

     type: "web_search",

     search_context_size: "high",

 };



 const openAIResponse = await fetch(

     "https://api.openai.com/v1/responses",

     {

         method: "POST",

         headers: {

             "Content-Type": "application/json",

             Authorization: `Bearer ${OPENAI_API_KEY}`,

         },

         body: JSON.stringify({

             model: "gpt-5.6-luna",

             tools: [webSearchTool],

             tool_choice: "required",

             input: [

                 {

                     role: "system",

                     content: agentConfig.system_instructions,

                 },

                 {

                     role: "user",

                     content: userPrompt,

                 },

             ],

             text: {

                 format: {

                     type: "json_schema",

                     name: "scholarship_discovery",

                     strict: true,

                     schema: {

                         type: "object",

                         properties: {

                             scholarships: {

                                 type: "array",

                                 items: {

                                     type: "object",

                                     properties: {

                                         name: { type: "string" },

                                         provider: { type: "string" },

                                         country: { type: "string" },

                                         degree_level: { type: "string" },

                                         field: { type: "string" },

                                         description: { type: "string" },

                                         funding_type: {

                                             type: "string",

                                             enum: [

                                                 "Fully Funded",

                                                 "Full Tuition",

                                                 "Partial Tuition",

                                                 "Stipend",

                                                 "Research Funding",

                                                 "Other"

                                             ],

                                         },

                                         amount: { type: "string" },

                                         currency: { type: "string" },

                                         eligibility: { type: "string" },

                                         application_open: { type: "string" },

                                         deadline: { type: "string" },

                                         official_url: { type: "string" },

                                         application_url: { type: "string" },

                                         status: {

                                             type: "string",

                                             enum: ["upcoming", "open", "closed", "unknown"],

                                         },

                                         confidence_score: { type: "number" },

                                         notes: { type: "string" },

                                     },

                                     required: [

                                         "name",

                                         "provider",

                                         "country",

                                         "degree_level",

                                         "field",

                                         "description",

                                         "funding_type",

                                         "amount",

                                         "currency",

                                         "eligibility",

                                         "application_open",

                                         "deadline",

                                         "official_url",

                                         "application_url",

                                         "status",

                                         "confidence_score",

                                         "notes"

                                     ],

                                     additionalProperties: false,

                                 },

                             },

                         },

                         required: ["scholarships"],

                         additionalProperties: false,

                     },

                 },

             },

         }),

     }

 );



 if (!openAIResponse.ok) {

     const errorText = await openAIResponse.text();

     const message = `OpenAI API error ${openAIResponse.status}: ${errorText}`;

     await failTask(message);

     throw new Error(message);

 }



 const openAIData = await openAIResponse.json();



 const outputText =

     openAIData.output

      ?.find((item: any) => item.type === "message")

      ?.content

      ?.find((item: any) => item.type === "output_text")

      ?.text;



 if (!outputText) {

     const message = `OpenAI returned no scholarship output text. Raw response: ${JSON.stringify(openAIData)}`;

     await failTask(message);

     throw new Error(message);

 }



 let scholarshipResponse: ScholarshipDiscoveryResponse;



 try {

     scholarshipResponse = JSON.parse(outputText);

 } catch {

     const message = `Could not parse scholarship discovery output: ${outputText}`;

     await failTask(message);

     throw new Error(message);

 }



 const scholarships = scholarshipResponse.scholarships ?? [];

 let resultsSaved = 0;

 let resultsUpdated = 0;



 for (const scholarship of scholarships) {

     const existingLookup = await supabase

         .from("research_results")

         .select("id, extracted_data, verification_status")

         .eq("country_id", task.country_id)

         .eq("entity_type", "scholarship")

         .eq("name", scholarship.name)

         .limit(1)

         .maybeSingle();



     if (!existingLookup) {

         console.error(`Scholarship duplicate lookup returned no response for ${scholarship.name}`);

         continue;

     }



     const { data: existingScholarship, error: existingError } = existingLookup;



     if (existingError) {

         console.error(

             `Could not check existing scholarship ${scholarship.name}:`,

             existingError.message

         );

         continue;

     }



     if (existingScholarship) {

         const existingData = existingScholarship.extracted_data ?? {};

         const mergedScholarship = {

             ...existingData,

             ...scholarship,

             official_url: scholarship.official_url || existingData.official_url || "",

             application_url: scholarship.application_url || existingData.application_url || "",

         };



         const updateResult = await supabase

             .from("research_results")

             .update({

                 research_queue_id: task.id,

                 source_id: task.source_id ?? null,

                 source_url: scholarship.official_url || existingData.official_url || null,

                 official_source: true,

                 extracted_data: mergedScholarship,

                 ai_summary: scholarship.description || existingData.description || null,

                 confidence_score: scholarship.confidence_score ?? existingData.confidence_score ?? null,

                 updated_at: new Date().toISOString(),

             })

             .eq("id", existingScholarship.id);



         if (!updateResult || updateResult.error) {

             console.error(

                 `Failed to update scholarship ${scholarship.name}:`,

                 updateResult?.error?.message ?? "no response returned"

             );

             continue;

         }



         resultsUpdated++;

         continue;

     }



     const insertResult = await supabase

         .from("research_results")

         .insert({

             research_queue_id: task.id,

             country_id: task.country_id,

             university_id: null,

             source_id: task.source_id ?? null,

             entity_type: "scholarship",

             name: scholarship.name,

             source_url: scholarship.official_url || null,

             official_source: true,

             extracted_data: scholarship,

             ai_summary: scholarship.description || null,

             verification_status: "pending",

             confidence_score: scholarship.confidence_score,

         });



     if (!insertResult || insertResult.error) {

         console.error(

             `Failed to save scholarship ${scholarship.name}:`,

             insertResult?.error?.message ?? "no response returned"

         );

         continue;

     }



     resultsSaved++;

 }



 const completionUpdate = await supabase

     .from("research_queue")

     .update({

         status: "completed",

         updated_at: new Date().toISOString(),

         error_message: null,

     })

     .eq("id", task.id);



 if (!completionUpdate || completionUpdate.error) {

     const message = `Could not complete scholarship task: ${completionUpdate?.error?.message ?? "no response returned"}`;

     await failTask(message);

     throw new Error(message);

 }



 await supabase

     .from("agent_runs")

     .update({

         status: "completed",

         completed_at: new Date().toISOString(),

         results_found: scholarships.length,

         results_verified: 0,

         notes: `Saved ${resultsSaved} scholarship discovery results and updated ${resultsUpdated}. Verification is still pending.`,

     })

     .eq("id", agentRun.id);



 return Response.json({

     success: true,

     task_id: task.id,

     agent_run_id: agentRun.id,

     task_type: "discover_scholarships",

     country: country.name,

     source: source?.name ?? null,

     results_found: scholarships.length,

     results_saved: resultsSaved,

     results_updated: resultsUpdated,

     verification_status: "pending",

 });

}



// ======================================================
// SCHOLARSHIP VERIFICATION
// ======================================================

async function runScholarshipVerification(
    supabase: any,
    task: any,
    country: any,
    source: any
) {
    if (!task?.research_result_id) {
        throw new Error(`Scholarship verification task ${task?.id ?? "unknown"} has no research_result_id`);
    }

    const resultLookup = await supabase
        .from("research_results")
        .select("*")
        .eq("id", task.research_result_id)
        .single();

    if (resultLookup == null) {
        throw new Error(`Scholarship research result lookup returned no response for task ${task.id}`);
    }
    if (resultLookup.error) {
        throw new Error(`Scholarship research result lookup failed: ${resultLookup.error?.message ?? String(resultLookup.error)}`);
    }

    const researchResult = resultLookup.data;
    if (!researchResult) {
        throw new Error(`Scholarship research result ${task.research_result_id} was not found`);
    }
    if (researchResult.entity_type !== "scholarship") {
        throw new Error(`Research result ${researchResult.id} is not a scholarship result`);
    }

    const configLookup = await supabase
        .from("ai_agent_configs")
        .select("*")
        .eq("agent_name", "scholarship_verification_agent")
        .eq("active", true)
        .single();

    if (configLookup == null) {
        throw new Error("Scholarship verification agent configuration lookup returned no response");
    }
    if (configLookup.error) {
        throw new Error(`Scholarship verification agent configuration lookup failed: ${configLookup.error?.message ?? String(configLookup.error)}`);
    }

    const agentConfig = configLookup.data;
    if (!agentConfig) {
        throw new Error("Active scholarship verification agent configuration was not found");
    }

    const processingUpdate = await supabase
        .from("research_queue")
        .update({
            status: "processing",
            attempts: (task.attempts ?? 0) + 1,
            last_attempt_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", task.id);

    if (processingUpdate == null) {
        throw new Error("Could not mark scholarship verification task as processing: no response returned");
    }
    if (processingUpdate.error) {
        throw new Error(`Could not mark scholarship verification task as processing: ${processingUpdate.error?.message ?? String(processingUpdate.error)}`);
    }

    const runInsert = await supabase
        .from("agent_runs")
        .insert({
            research_queue_id: task.id,
            agent_name: "scholarship_verification_agent",
            run_type: "scholarship_verification",
            status: "running",
        })
        .select()
        .single();

    if (runInsert == null) {
        await supabase.from("research_queue").update({ status: "pending", error_message: "Scholarship verification agent run creation returned no response", updated_at: new Date().toISOString() }).eq("id", task.id);
        throw new Error("Scholarship verification agent run creation returned no response");
    }
    if (runInsert.error) {
        await supabase.from("research_queue").update({ status: "pending", error_message: runInsert.error?.message ?? String(runInsert.error), updated_at: new Date().toISOString() }).eq("id", task.id);
        throw new Error(`Scholarship verification agent run creation failed: ${runInsert.error?.message ?? String(runInsert.error)}`);
    }

    const agentRun = runInsert.data;
    const discovered = researchResult.extracted_data ?? {};

    const failTask = async (message: string) => {
        try {
            await supabase.from("research_queue").update({ status: "pending", error_message: message, updated_at: new Date().toISOString() }).eq("id", task.id);
        } catch {}
        if (agentRun?.id) {
            try {
                await supabase.from("agent_runs").update({ status: "failed", completed_at: new Date().toISOString(), error_message: message }).eq("id", agentRun.id);
            } catch {}
        }
    };

    const userPrompt = `
Verify this previously discovered scholarship or funding opportunity using official sources only.

Country context:
${country?.name ?? discovered.country ?? ""} (${country?.code ?? ""})

Discovered scholarship:
${researchResult.name ?? discovered.name ?? ""}

Discovered provider:
${discovered.provider ?? ""}

Original official/source URL:
${researchResult.source_url ?? discovered.official_url ?? ""}

Original discovery data:
${JSON.stringify(discovered)}

Your task is SCHOLARSHIP VERIFICATION ONLY.

Verify the exact scholarship record and return the corrected current official information.

Rules:
- Use the scholarship provider, government, university or other official source as primary evidence.
- Verify exact scholarship name and provider.
- Verify country/countries where the scholarship can be used.
- Verify degree level and field only when explicitly published.
- Verify funding type and amount only when explicitly published. Never estimate.
- Preserve the original currency.
- Verify eligibility, including nationality restrictions when stated.
- Verify application opening date and deadline when explicitly published.
- Verify official_url and application_url using exact official URLs.
- Do not reject a scholarship merely because it is closed or expired; use status closed.
- Missing optional fields alone must not cause needs_review.
- Use needs_review only for a genuine unresolved conflict, ambiguity, or insufficient official evidence for an important field.
- Use rejected only when the discovered scholarship cannot be reliably matched to an official opportunity or is materially incorrect.
- Confidence 0.90 or higher only when identity and key eligibility/deadline information are clearly supported.
- Current date: ${new Date().toISOString().slice(0, 10)}. Use it only to determine status from verified dates, never to invent a date.
`;

    const webSearchTool: Record<string, unknown> = {
        type: "web_search",
        search_context_size: "medium",
    };

    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-5.6-luna",
            tools: [webSearchTool],
            tool_choice: "required",
            input: [
                { role: "system", content: agentConfig.system_instructions },
                { role: "user", content: userPrompt },
            ],
            text: {
                format: {
                    type: "json_schema",
                    name: "scholarship_verification",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            verification: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    provider: { type: "string" },
                                    country: { type: "string" },
                                    degree_level: { type: "string" },
                                    field: { type: "string" },
                                    description: { type: "string" },
                                    funding_type: { type: "string", enum: ["Fully Funded", "Full Tuition", "Partial Tuition", "Stipend", "Research Funding", "Other"] },
                                    amount: { type: "string" },
                                    currency: { type: "string" },
                                    eligibility: { type: "string" },
                                    application_open: { type: "string" },
                                    deadline: { type: "string" },
                                    official_url: { type: "string" },
                                    application_url: { type: "string" },
                                    status: { type: "string", enum: ["upcoming", "open", "closed", "unknown"] },
                                    confidence_score: { type: "number" },
                                    verification_status: { type: "string", enum: ["verified", "needs_review", "rejected"] },
                                    verification_notes: { type: "string" },
                                },
                                required: [
                                    "name", "provider", "country", "degree_level", "field", "description",
                                    "funding_type", "amount", "currency", "eligibility", "application_open", "deadline",
                                    "official_url", "application_url", "status", "confidence_score",
                                    "verification_status", "verification_notes"
                                ],
                                additionalProperties: false,
                            },
                        },
                        required: ["verification"],
                        additionalProperties: false,
                    },
                },
            },
        }),
    });

    if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        const message = `OpenAI API error ${openAIResponse.status}: ${errorText}`;
        await failTask(message);
        throw new Error(message);
    }

    const openAIData = await openAIResponse.json();
    const outputText = openAIData.output
        ?.find((item: any) => item.type === "message")
        ?.content
        ?.find((item: any) => item.type === "output_text")
        ?.text;

    if (!outputText) {
        const message = `OpenAI returned no scholarship verification output text. Raw response: ${JSON.stringify(openAIData)}`;
        await failTask(message);
        throw new Error(message);
    }

    let verificationResponse: ScholarshipVerificationResponse;
    try {
        verificationResponse = JSON.parse(outputText);
    } catch {
        const message = `Could not parse scholarship verification output: ${outputText}`;
        await failTask(message);
        throw new Error(message);
    }

    const verification = verificationResponse.verification;
    if (!verification) {
        const message = "Scholarship verification response did not contain a verification object";
        await failTask(message);
        throw new Error(message);
    }

    const resultUpdate = await supabase
        .from("research_results")
        .update({
            name: verification.name || researchResult.name,
            source_url: verification.official_url || researchResult.source_url || null,
            official_source: true,
            extracted_data: verification,
            ai_summary: verification.description || researchResult.ai_summary || null,
            verification_status: verification.verification_status,
            confidence_score: verification.confidence_score,
            verified_at: verification.verification_status === "verified" ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", researchResult.id);

    if (resultUpdate == null || resultUpdate.error) {
        const message = `Failed to update scholarship research result: ${resultUpdate?.error?.message ?? "no response returned"}`;
        await failTask(message);
        throw new Error(message);
    }

    const logInsert = await supabase
        .from("verification_log")
        .insert({
            research_result_id: researchResult.id,
            verification_type: "official_source_check",
            result: verification.verification_status === "verified" ? "passed" : verification.verification_status === "needs_review" ? "needs_review" : "failed",
            checked_url: verification.official_url || researchResult.source_url || null,
            evidence: verification.verification_notes,
            notes: verification.description || null,
        });

    if (logInsert?.error) {
        console.error("Scholarship verification log failed:", logInsert.error.message);
    }

    const completionUpdate = await supabase
        .from("research_queue")
        .update({ status: "completed", updated_at: new Date().toISOString(), error_message: null })
        .eq("id", task.id);

    if (completionUpdate == null || completionUpdate.error) {
        const message = `Could not complete scholarship verification task: ${completionUpdate?.error?.message ?? "no response returned"}`;
        await failTask(message);
        throw new Error(message);
    }

    if (agentRun?.id) {
        const runUpdate = await supabase
            .from("agent_runs")
            .update({
                status: "completed",
                completed_at: new Date().toISOString(),
                results_found: 1,
                results_verified: verification.verification_status === "verified" ? 1 : 0,
                error_message: null,
                notes: `Scholarship verification status: ${verification.verification_status}.`,
            })
            .eq("id", agentRun.id);
        if (runUpdate?.error) {
            console.error("Scholarship verification agent run completion failed:", runUpdate.error.message);
        }
    }

    return Response.json({
        success: true,
        task_id: task.id,
        agent_run_id: agentRun?.id ?? null,
        task_type: "verify_scholarship",
        country: country?.name ?? null,
        research_result_id: researchResult.id,
        scholarship: verification.name,
        provider: verification.provider,
        verification_status: verification.verification_status,
        deadline: verification.deadline,
        status: verification.status,
        confidence_score: verification.confidence_score,
    });
}

// ======================================================

// ADMISSIONS DISCOVERY

// ======================================================



async function runAdmissionDiscovery(
    supabase: any,
    task: any,
    country: any,
    source: any
){
    // This workflow supports two modes:
    // 1) programme-specific discovery (legacy): research_result_id + university_id
    // 2) shared/national discovery: target_url only, with no programme/university required
    const isProgrammeSpecific = Boolean(task.research_result_id);

    let programmeResult: any = null;
    let university: any = null;
    let existing: any = {};
    let programmeName = "";

    if (isProgrammeSpecific) {
        const programmeLookup = await supabase
            .from("research_results")
            .select("*")
            .eq("id", task.research_result_id)
            .eq("entity_type", "programme")
            .single();

        if (!programmeLookup) {
            throw new Error("Programme research result lookup returned no response");
        }

        const { data, error } = programmeLookup;
        if (error) {
            throw new Error(`Programme research result lookup failed: ${error.message}`);
        }
        if (!data) {
            throw new Error(`Programme research result ${task.research_result_id} was not found`);
        }

        programmeResult = data;
        existing = programmeResult.extracted_data ?? {};
        programmeName = programmeResult.name ?? existing.name ?? "";

        if (!task.university_id) {
            throw new Error(
                `Programme-specific admissions discovery task ${task.id} has no university_id`
            );
        }
    } else if (!task.target_url) {
        throw new Error(
            `Shared admissions discovery task ${task.id} needs a target_url when research_result_id is absent`
        );
    }

    if (task.university_id) {
        const universityLookup = await supabase
            .from("universities")
            .select("*")
            .eq("id", task.university_id)
            .single();

        if (!universityLookup) {
            throw new Error("University lookup returned no response");
        }

        const { data, error } = universityLookup;
        if (error) {
            throw new Error(`University lookup failed: ${error.message}`);
        }
        university = data;
    }

    const agentConfigLookup = await supabase
        .from("ai_agent_configs")
        .select("*")
        .eq("agent_name", "admission_deadline_agent")
        .eq("active", true)
        .single();

    if (!agentConfigLookup) {
        throw new Error("Admissions agent configuration lookup returned no response");
    }

    const { data: agentConfig, error: configError } = agentConfigLookup;
    if (configError) {
        throw new Error(
            `Admissions agent configuration lookup failed: ${configError.message}`
        );
    }
    if (!agentConfig) {
        throw new Error("Active admission_deadline_agent configuration was not found");
    }

    const processingUpdate = await supabase
        .from("research_queue")
        .update({
            status: "processing",
            attempts: (task.attempts ?? 0) + 1,
            last_attempt_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", task.id);

    if (!processingUpdate) {
        throw new Error("Could not mark admissions task as processing: no response returned");
    }
    if (processingUpdate.error) {
        throw new Error(
            `Could not mark admissions task as processing: ${processingUpdate.error.message}`
        );
    }

    const agentRunInsert = await supabase
        .from("agent_runs")
        .insert({
            research_queue_id: task.id,
            agent_name: "admission_deadline_agent",
            run_type: "admission_discovery",
            status: "running",
        })
        .select()
        .single();

    if (!agentRunInsert) {
        await supabase.from("research_queue").update({
            status: "pending",
            error_message: "Admissions discovery agent run creation returned no response",
            updated_at: new Date().toISOString(),
        }).eq("id", task.id);
        throw new Error("Admissions discovery agent run creation returned no response");
    }

    const { data: agentRun, error: runError } = agentRunInsert;
    if (runError) {
        await supabase.from("research_queue").update({
            status: "pending",
            error_message: runError.message,
            updated_at: new Date().toISOString(),
        }).eq("id", task.id);
        throw new Error(`Admissions discovery agent run creation failed: ${runError.message}`);
    }

    const allowedDomains = new Set<string>();
    const addDomain = (url: string | null | undefined) => {
        if (!url) return;
        try {
            const hostname = new URL(url)
                .hostname
                .toLowerCase()
                .replace(/^www\./, "");
            if (hostname) allowedDomains.add(hostname);
        } catch {
            // Ignore invalid URLs.
        }
    };

    addDomain(task.target_url);
    addDomain(source?.url);
    addDomain(university?.website_url);
    addDomain(university?.admissions_url);
    addDomain(university?.international_url);
    addDomain(existing.programme_url);
    addDomain(existing.application_url);
    addDomain(existing.source_url);
    addDomain(programmeResult?.source_url);

    const officialDomains = Array.from(allowedDomains);

    const userPrompt = isProgrammeSpecific
        ? `
Research official admission/application information for this academic programme.

Country:
${country.name} (${country.code})

University:
${university?.name ?? ""}

Official university website:
${university?.website_url ?? ""}

Official admissions URL:
${university?.admissions_url ?? ""}

Official international-student URL:
${university?.international_url ?? ""}

Programme:
${programmeName}

Programme degree level:
${existing.degree_level ?? ""}

Official programme URL:
${existing.programme_url ?? ""}

Official application URL:
${existing.application_url ?? ""}

Original programme source:
${programmeResult?.source_url ?? existing.source_url ?? ""}

Your task is ADMISSIONS DISCOVERY ONLY.

Find the currently published official admission/application information for this exact programme.
For every distinct published intake or admission cycle you can verify, return:
- programme_name
- intake
- academic_year
- application_open
- application_deadline
- international_deadline
- programme_start_date
- application_url
- exact official source URL used as evidence
- status
- confidence score from 0 to 1
- short factual notes

Important rules:
- Use the university's official website as the primary authority.
- Official admissions, international-student and government/national admissions sources may support the finding.
- Search for programme-specific admission information whenever possible.
- Search specifically for the current or next published intake/cycle.
- If an international-student deadline is separately published, capture it in international_deadline.
- Do not confuse a general university deadline with a programme-specific deadline.
- Do not invent or estimate dates.
- If a date is not published, return an empty string.
- Preserve the date exactly as published when possible.
- Do not assume that a deadline applies to international students.
- Do not add scholarship information.
- Do not discover PhD research vacancies; those belong to the PhD research-position workflow.
- If only a general admissions page is available and it clearly applies to this programme, it may be used as supporting evidence.
- If no current admission information can be verified, return an admission record with status "unknown" only when there is reliable official evidence about the programme but no published dates.
- Avoid duplicate admission cycles.
- Only return admission information reasonably supported by official sources.
`
        : `
Research the official shared/national admissions calendar for ${country.name} (${country.code}).

Official source:
${source?.name ?? "Official admissions source"}
${source?.url ?? ""}

Target page:
${task.target_url ?? ""}

Your task is SHARED/NATIONAL ADMISSIONS DISCOVERY ONLY.

This task is NOT tied to one university or one programme. Find the currently published official application rounds, intakes and deadlines that may apply across universities/programmes using this national admissions system.

For every distinct current or future published admission round/intake you can verify, return:
- programme_name: use a descriptive scope label such as "National admissions — Master's programmes", "National admissions — Bachelor's programmes", or "National admissions — general". Do NOT invent an individual programme name.
- intake
- academic_year
- application_open
- application_deadline
- international_deadline
- programme_start_date
- application_url
- exact official source URL used as evidence
- status
- confidence score from 0 to 1
- short factual notes explaining exactly which applicants/programmes the dates apply to

Important rules:
- Start with the supplied target page and use official sources only.
- Prefer dates for the current or next published admission cycles as of today.
- Capture separate first/second admission rounds when officially published.
- Capture separate international-student deadlines only when explicitly published.
- Do not assume one national deadline applies to every Swedish university or programme.
- Clearly state scope/exceptions in notes.
- Do not invent or estimate dates.
- If a date is not published, return an empty string.
- Preserve the date exactly as published when possible.
- Do not add scholarships, tuition fees, or PhD vacancy deadlines.
- Do not create individual programme records in this task.
- Avoid duplicate rounds.
- Only return information supported by official sources.
`;

    const webSearchTool: Record<string, unknown> = {
        type: "web_search",
        search_context_size: "high",
    };

    if (officialDomains.length > 0) {
        webSearchTool.filters = {
            allowed_domains: officialDomains,
        };
    }

    const openAIResponse = await fetch(
        "https://api.openai.com/v1/responses",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-5.6-luna",
                tools: [webSearchTool],
                tool_choice: "required",
                input: [
                    {
                        role: "system",
                        content: agentConfig.system_instructions,
                    },
                    {
                        role: "user",
                        content: userPrompt,
                    },
                ],
                text: {
                    format: {
                        type: "json_schema",
                        name: "admission_discovery",
                        strict: true,
                        schema: {
                            type: "object",
                            properties: {
                                admissions: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            programme_name: { type: "string" },
                                            intake: { type: "string" },
                                            academic_year: { type: "string" },
                                            application_open: { type: "string" },
                                            application_deadline: { type: "string" },
                                            international_deadline: { type: "string" },
                                            programme_start_date: { type: "string" },
                                            application_url: { type: "string" },
                                            source_url: { type: "string" },
                                            status: {
                                                type: "string",
                                                enum: ["upcoming", "open", "closed", "unknown"],
                                            },
                                            confidence_score: { type: "number" },
                                            notes: { type: "string" },
                                        },
                                        required: [
                                            "programme_name",
                                            "intake",
                                            "academic_year",
                                            "application_open",
                                            "application_deadline",
                                            "international_deadline",
                                            "programme_start_date",
                                            "application_url",
                                            "source_url",
                                            "status",
                                            "confidence_score",
                                            "notes",
                                        ],
                                        additionalProperties: false,
                                    },
                                },
                            },
                            required: ["admissions"],
                            additionalProperties: false,
                        },
                    },
                },
            }),
        }
    );

    if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();

        await supabase
            .from("research_queue")
            .update({
                status: "pending",
                error_message: errorText,
                updated_at: new Date().toISOString(),
            })
            .eq("id", task.id);

        if (agentRun?.id) {
            await supabase
                .from("agent_runs")
                .update({
                    status: "failed",
                    completed_at: new Date().toISOString(),
                    error_message: `OpenAI API error ${openAIResponse.status}: ${errorText}`,
                })
                .eq("id", agentRun.id);
        }

        throw new Error(`OpenAI API error ${openAIResponse.status}: ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    const outputText = openAIData.output
        ?.find((item: any) => item.type === "message")
        ?.content
        ?.find((item: any) => item.type === "output_text")
        ?.text;

    if (!outputText) {
        const message = `OpenAI returned no output text. Raw response: ${JSON.stringify(openAIData)}`;
        await supabase.from("research_queue").update({
            status: "pending",
            error_message: message,
            updated_at: new Date().toISOString(),
        }).eq("id", task.id);
        if (agentRun?.id) {
            await supabase.from("agent_runs").update({
                status: "failed",
                completed_at: new Date().toISOString(),
                error_message: message,
            }).eq("id", agentRun.id);
        }
        throw new Error(message);
    }

    let admissionResponse: AdmissionDiscoveryResponse;
    try {
        admissionResponse = JSON.parse(outputText);
    } catch {
        const message = `Could not parse admission discovery output: ${outputText}`;
        await supabase.from("research_queue").update({
            status: "pending",
            error_message: message,
            updated_at: new Date().toISOString(),
        }).eq("id", task.id);
        if (agentRun?.id) {
            await supabase.from("agent_runs").update({
                status: "failed",
                completed_at: new Date().toISOString(),
                error_message: message,
            }).eq("id", agentRun.id);
        }
        throw new Error(message);
    }

    const admissions = Array.isArray(admissionResponse.admissions)
        ? admissionResponse.admissions
        : [];

    let resultsSaved = 0;
    let resultsUpdated = 0;

    for (const admission of admissions) {
        const returnedProgrammeName = (admission.programme_name ?? "").trim();
        const scopeName = returnedProgrammeName ||
            (isProgrammeSpecific ? programmeName : "National admissions — general");

        const admissionName = admission.intake || admission.academic_year
            ? `${scopeName} — ${admission.intake || admission.academic_year}`
            : scopeName;

        const admissionData = {
            ...admission,
            programme_name: scopeName,
            programme_research_result_id: programmeResult?.id ?? null,
            discovery_scope: isProgrammeSpecific
                ? "programme"
                : (task.university_id ? "university_shared" : "national_shared"),
            target_url: task.target_url ?? null,
            university_id: task.university_id ?? null,
        };

        let existingQuery = supabase
            .from("research_results")
            .select("id, extracted_data")
            .eq("entity_type", "admission")
            .eq("country_id", task.country_id)
            .eq("name", admissionName);

        if (task.university_id) {
            existingQuery = existingQuery.eq("university_id", task.university_id);
        } else {
            existingQuery = existingQuery.is("university_id", null);
        }

        const existingLookup = await existingQuery.maybeSingle();

        if (existingLookup.error) {
            console.error(
                `Admission lookup failed for ${admissionName}:`,
                existingLookup.error.message
            );
            continue;
        }

        if (existingLookup.data) {
            const oldData = existingLookup.data.extracted_data ?? {};
            const { error: updateError } = await supabase
                .from("research_results")
                .update({
                    research_queue_id: task.id,
                    country_id: task.country_id,
                    university_id: task.university_id ?? null,
                    source_id: task.source_id ?? null,
                    source_url: admission.source_url || oldData.source_url || task.target_url || null,
                    official_source: true,
                    extracted_data: {
                        ...oldData,
                        ...admissionData,
                    },
                    ai_summary: admission.notes || null,
                    confidence_score: admission.confidence_score ?? null,
                    verification_status: "pending",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existingLookup.data.id);

            if (updateError) {
                console.error(
                    `Failed to update admission ${admissionName}:`,
                    updateError.message
                );
                continue;
            }

            resultsUpdated++;
            continue;
        }

        const { error: insertError } = await supabase
            .from("research_results")
            .insert({
                research_queue_id: task.id,
                country_id: task.country_id,
                university_id: task.university_id ?? null,
                source_id: task.source_id ?? null,
                entity_type: "admission",
                name: admissionName,
                source_url: admission.source_url || task.target_url || null,
                official_source: true,
                extracted_data: admissionData,
                ai_summary: admission.notes || null,
                verification_status: "pending",
                confidence_score: admission.confidence_score ?? null,
            });

        if (insertError) {
            console.error(
                `Failed to save admission ${admissionName}:`,
                insertError.message
            );
            continue;
        }

        resultsSaved++;
    }

    await supabase
        .from("research_queue")
        .update({
            status: "completed",
            updated_at: new Date().toISOString(),
            error_message: null,
        })
        .eq("id", task.id);

    if (agentRun?.id) {
        await supabase
            .from("agent_runs")
            .update({
                status: "completed",
                completed_at: new Date().toISOString(),
                results_found: admissions.length,
                results_verified: 0,
                notes: isProgrammeSpecific
                    ? `Saved ${resultsSaved} programme admission discovery results and updated ${resultsUpdated}. Admission verification is still pending.`
                    : `Saved ${resultsSaved} shared admission discovery results and updated ${resultsUpdated}. These shared dates must be mapped to applicable programmes before production use.`,
            })
            .eq("id", agentRun.id);
    }

    return Response.json({
        success: true,
        task_id: task.id,
        agent_run_id: agentRun?.id ?? null,
        task_type: "discover_admissions",
        discovery_scope: isProgrammeSpecific
            ? "programme"
            : (task.university_id ? "university_shared" : "national_shared"),
        country: country.name,
        university: university?.name ?? null,
        university_id: university?.id ?? null,
        programme: isProgrammeSpecific ? programmeName : null,
        research_result_id: programmeResult?.id ?? null,
        target_url: task.target_url ?? null,
        results_found: admissions.length,
        results_saved: resultsSaved,
        results_updated: resultsUpdated,
        verification_status: "pending",
    });
}


// BATCH ADMISSIONS DISCOVERY

// ======================================================



async function processPendingAdmissionDiscoveries(
    supabase: any,
    limit: number
) {
    let lookup: any;

    try {
        lookup = await supabase
            .from("research_queue")
            .select("*")
            .eq("task_type", "discover_admissions")
            .eq("status", "pending")
            .order("priority", { ascending: true })
            .order("created_at", { ascending: true })
            .limit(limit);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Admissions task lookup threw an exception:", error);
        return Response.json({ success: false, action: "process_pending", task_type: "discover_admissions", error: `Admissions task lookup exception: ${message}` }, { status: 500 });
    }

    if (lookup == null) {
        return Response.json({ success: false, action: "process_pending", task_type: "discover_admissions", error: "Admissions task lookup returned no response object." }, { status: 500 });
    }

    const taskError = lookup.error;
    if (taskError) {
        const message = taskError?.message ?? String(taskError);
        return Response.json({ success: false, action: "process_pending", task_type: "discover_admissions", error: `Admissions task lookup failed: ${message}` }, { status: 500 });
    }

    const selected = Array.isArray(lookup.data) ? lookup.data : [];
    if (selected.length === 0) {
        return Response.json({ success: true, action: "process_pending", task_type: "discover_admissions", requested_limit: limit, selected: 0, processed: 0, succeeded: 0, failed: 0, results: [], message: "No pending admission discovery tasks." });
    }

    const results: any[] = [];

    for (const task of selected) {
        try {
            if (!task?.id) throw new Error("Selected admission task has no id.");
            if (!task.country_id) throw new Error(`Admission task ${task.id} has no country_id.`);

            let countryLookup: any;
            try {
                countryLookup = await supabase.from("countries").select("*").eq("id", task.country_id).single();
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                throw new Error(`Country lookup exception for task ${task.id}: ${message}`);
            }
            if (countryLookup == null) throw new Error(`Country lookup returned no response for task ${task.id}.`);
            if (countryLookup.error) throw new Error(`Country lookup failed for task ${task.id}: ${countryLookup.error?.message ?? String(countryLookup.error)}`);
            if (!countryLookup.data) throw new Error(`Country ${task.country_id} was not found for task ${task.id}.`);

            let source = null;
            if (task.source_id) {
                let sourceLookup: any;
                try {
                    sourceLookup = await supabase.from("sources").select("*").eq("id", task.source_id).single();
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    throw new Error(`Source lookup exception for task ${task.id}: ${message}`);
                }
                if (sourceLookup == null) throw new Error(`Source lookup returned no response for task ${task.id}.`);
                if (sourceLookup.error) throw new Error(`Source lookup failed for task ${task.id}: ${sourceLookup.error?.message ?? String(sourceLookup.error)}`);
                source = sourceLookup.data ?? null;
            }

            let response: Response | null = null;
            try {
                response = await runAdmissionDiscovery(supabase, task, countryLookup.data, source);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                throw new Error(`Admissions discovery failed for task ${task.id}: ${message}`);
            }
            if (response == null) throw new Error(`Admissions discovery returned no response for task ${task.id}.`);

            const responseStatus = Number(response.status);
            if (!Number.isFinite(responseStatus) || responseStatus < 200 || responseStatus >= 300) {
                throw new Error(`Admissions discovery returned HTTP ${Number.isFinite(responseStatus) ? responseStatus : "unknown"} for task ${task.id}.`);
            }

            results.push({ task_id: task.id, success: true, status_code: responseStatus });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`Admissions discovery batch failed for task ${task?.id ?? "unknown"}:`, error);

            if (task?.id) {
                try {
                    const resetResult = await supabase.from("research_queue").update({ status: "pending", error_message: message, updated_at: new Date().toISOString() }).eq("id", task.id);
                    if (resetResult?.error) console.error(`Could not reset failed admission task ${task.id}:`, resetResult.error.message);
                } catch (resetError) {
                    console.error(`Could not reset failed admission task ${task.id}:`, resetError);
                }
            }

            results.push({ task_id: task?.id ?? null, success: false, status_code: 500, error: message });
        }
    }

    const succeeded = results.filter((item) => item?.success === true).length;
    const failed = results.length - succeeded;

    return Response.json({ success: true, action: "process_pending", task_type: "discover_admissions", requested_limit: limit, selected: selected.length, processed: results.length, succeeded, failed, results });
}

// DEADLINE VERIFICATION

// ======================================================



async function runDeadlineVerification(

    supabase: any,

    task: any,

    country: any,

    source: any

){

 if (!task.research_result_id) {

     throw new Error(`Deadline verification task ${task.id} has no research_result_id`);

 }



 const { data: researchResult, error: resultError } = await supabase

     .from("research_results")

     .select("*")

     .eq("id", task.research_result_id)

     .single();



 if (resultError) {

     throw new Error(`Admission research result lookup failed: ${resultError.message}`);

 }



 if (researchResult.entity_type !== "admission") {

     throw new Error(`Research result ${researchResult.id} is not an admission result`);

 }



 const { data: university, error: universityError } = await supabase

     .from("universities")

     .select("*")

     .eq("id", task.university_id)

     .single();



 if (universityError) {

     throw new Error(`University lookup failed: ${universityError.message}`);

 }

const { data: agentConfig, error: configError } = await supabase

    .from("ai_agent_configs")

    .select("*")

    .eq("agent_name", "admission_deadline_agent")

    .eq("active", true)

    .single();



if (configError) {

  throw new Error(`Admission deadline agent configuration lookup failed:
${configError.message}`);

}



const { error: processingError } = await supabase

    .from("research_queue")

    .update({

     status: "processing",

     attempts: (task.attempts ?? 0) + 1,

     last_attempt_at: new Date().toISOString(),

     updated_at: new Date().toISOString(),

    })

    .eq("id", task.id);



if (processingError) {

  throw new Error(`Could not mark deadline verification task as processing:
${processingError.message}`);

}



const { data: agentRun, error: runError } = await supabase

    .from("agent_runs")

    .insert({

     research_queue_id: task.id,

     agent_name: "admission_deadline_agent",

     run_type: "deadline_verification",

     status: "running",

    })

    .select()

    .single();



if (runError) {

    await supabase.from("research_queue").update({

     status: "pending",

     error_message: runError.message,

     updated_at: new Date().toISOString(),

    }).eq("id", task.id);

  throw new Error(`Admission deadline agent run creation failed:
${runError.message}`);

}



const existing = researchResult.extracted_data ?? {};

const allowedDomains = new Set<string>();



const addDomain = (url: string | null | undefined) => {

    if (!url) return;

    try {

     const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");

     if (hostname) allowedDomains.add(hostname);

  } catch {}

 };



 addDomain(university.website_url);

 addDomain(university.admissions_url);

 addDomain(university.international_url);

 addDomain(existing.application_url);

 addDomain(existing.source_url);

 addDomain(source?.url);



 const officialDomains = Array.from(allowedDomains);



 const userPrompt = `

Verify this university admission/deadline record using official sources only.

Country:

${country.name} (${country.code})

University:

${university.name}

Official university website:

${university.website_url ?? ""}

Official admissions URL:

${university.admissions_url ?? ""}

Official international-student URL:

${university.international_url ?? ""}

Admission record name:

${researchResult.name}

Discovered admission data:

${JSON.stringify(existing, null, 2)}

Rules:

- This is DEADLINE VERIFICATION ONLY.

- Use the university's official website as the primary authority.

- Official national/government admissions portals may support the verification.

- Verify the exact admission/intake record against the current official source.

- Verify application_open and application_deadline when explicitly published.

- Verify international_deadline only when an international-student deadline is explicitly
published.

- Verify programme_start_date only when an official source explicitly publishes it.

- Do not invent, infer or calculate dates that are not explicitly supported.

- If an optional date is not published, leave that field empty.

- A missing optional date by itself MUST NOT cause needs_review.

- If a general international-student deadline applies to the university or admission cycle
but is not explicitly programme-specific, it may be recorded in international_deadline
ONLY when the verification_notes clearly state that it is a general international deadline
and not a programme-specific deadline.

- A clearly identified general international deadline MUST NOT by itself cause
needs_review.

- Preserve the exact official admission/intake wording when verified.

- Verify the academic year and intake only when supported.

- Verify application_url and source_url using exact official URLs.

- Do not replace an official specific application page with a homepage when a specific
page exists.

- If the exact admission record and its main application deadline are clearly supported
by an official source, mark the record verified even when programme_start_date is
unavailable.

- If the exact admission record and its main application deadline are clearly supported,
mark the record verified even when no programme-specific international deadline is
published.

- Use needs_review when there is a genuine unresolved issue.

- Genuine unresolved issues include conflicting official dates, an ambiguous admission
stage or intake, inability to match the admission record to official
programme/admission information, or inability to verify the main application deadline.

- If conflicting official dates are found, use needs_review and explain the conflict.

- Use rejected only when reliable official evidence shows the record is not applicable or
cannot be matched to the university or admission cycle.

- Confidence 0.90 or higher only when the exact admission record and its key
application deadline are clearly supported by official sources.

- Do not reduce confidence merely because programme_start_date is unavailable.

- Do not reduce confidence merely because a programme-specific international
deadline is unavailable.

- The verification_status must reflect the quality of the evidence, not the completeness
of optional fields.

- The current date is ${new Date().toISOString().slice(0, 10)}; use it only to determine
status from verified dates, never to create a date.

Return one verification result for this admission record.

`;



const webSearchTool: Record<string, unknown> = {

    type: "web_search",

    search_context_size: "high",

};

if (officialDomains.length > 0) {

    webSearchTool.filters = { allowed_domains: officialDomains };

}



const openAIResponse = await fetch("https://api.openai.com/v1/responses", {

    method: "POST",

    headers: {

     "Content-Type": "application/json",

 Authorization: `Bearer ${OPENAI_API_KEY}`,

},

body: JSON.stringify({

 model: "gpt-5.6-luna",

 tools: [webSearchTool],

 tool_choice: "required",

 input: [

     { role: "system", content: agentConfig.system_instructions },

     { role: "user", content: userPrompt },

 ],

 text: {

     format: {

      type: "json_schema",

      name: "deadline_verification",

      strict: true,

      schema: {

       type: "object",

       properties: {

        verification: {

         type: "object",

         properties: {

           name: { type: "string" },

           programme_name: { type: "string" },

           intake: { type: "string" },

           academic_year: { type: "string" },

           application_open: { type: "string" },

           application_deadline: { type: "string" },

           international_deadline: { type: "string" },

                     programme_start_date: { type: "string" },

                     application_url: { type: "string" },

                     source_url: { type: "string" },

                     status: { type: "string", enum: ["upcoming", "open", "closed", "unknown"] },

                     confidence_score: { type: "number" },

                     verification_status: { type: "string", enum: ["verified", "needs_review", "rejected"]
},

                     verification_notes: { type: "string" },

                 },

                 required: [

                     "name", "programme_name", "intake", "academic_year",

                     "application_open", "application_deadline", "international_deadline",

                     "programme_start_date", "application_url", "source_url", "status",

                     "confidence_score", "verification_status", "verification_notes"

                 ],

                 additionalProperties: false,

                },

            },

            required: ["verification"],

            additionalProperties: false,

           },

       },

      },

     }),

 });



 if (!openAIResponse.ok) {

     const errorText = await openAIResponse.text();

    await supabase.from("research_queue").update({

     status: "pending",

     error_message: errorText,

     updated_at: new Date().toISOString(),

    }).eq("id", task.id);

    await supabase.from("agent_runs").update({

     status: "failed",

     completed_at: new Date().toISOString(),

     error_message: `OpenAI API error ${openAIResponse.status}: ${errorText}`,

    }).eq("id", agentRun.id);

    throw new Error(`OpenAI API error ${openAIResponse.status}: ${errorText}`);

}



const openAIData = await openAIResponse.json();

const outputText = openAIData.output

    ?.find((item: any) => item.type === "message")

    ?.content

    ?.find((item: any) => item.type === "output_text")

    ?.text;



if (!outputText) {

  throw new Error(`OpenAI returned no output text. Raw response:
${JSON.stringify(openAIData)}`);

}



let parsed: DeadlineVerificationResponse;

try {

    parsed = JSON.parse(outputText);

} catch {

    throw new Error(`Could not parse deadline verification output: ${outputText}`);

}



const verification = parsed.verification;

if (!verification) throw new Error("Deadline verification returned no verification result");



if (!verification.source_url && !verification.application_url) {

    verification.confidence_score = Math.min(verification.confidence_score, 0.89);

}



const mergedData = { ...existing, ...verification };

const { error: updateError } = await supabase

    .from("research_results")

    .update({

     name: verification.name || researchResult.name,

     source_url: verification.source_url || researchResult.source_url || null,

     extracted_data: mergedData,

     ai_summary: verification.verification_notes || researchResult.ai_summary || null,

     verification_status: verification.verification_status,

     confidence_score: verification.confidence_score,

  verified_at: verification.verification_status === "verified" ? new Date().toISOString() :
null,

     updated_at: new Date().toISOString(),

    })

    .eq("id", researchResult.id);



 if (updateError) throw new Error(`Failed to update deadline verification result:
${updateError.message}`);

 const logResult = verification.verification_status === "verified" ? "passed" :
verification.verification_status === "rejected" ? "failed" : "needs_review";

const { error: logError } = await supabase.from("verification_log").insert({

 research_result_id: researchResult.id,

 verification_type: "deadline_check",

 result: logResult,

  checked_url: verification.source_url || verification.application_url ||
researchResult.source_url || null,

 evidence: verification.verification_notes || null,

 notes: `Admission deadline verification checked ${researchResult.name}.`,

});

if (logError) console.error("Deadline verification log insert failed:", logError.message);



await supabase.from("research_queue").update({

 status: "completed",

 updated_at: new Date().toISOString(),

 error_message: null,

}).eq("id", task.id);



await supabase.from("agent_runs").update({

 status: "completed",

  completed_at: new Date().toISOString(),

 results_found: 1,

 results_verified: verification.verification_status === "verified" ? 1 : 0,

 notes: `Deadline verification status: ${verification.verification_status}.`,

}).eq("id", agentRun.id);



return Response.json({

     success: true,

     task_id: task.id,

     agent_run_id: agentRun.id,

     task_type: "verify_deadline",

     country: country.name,

     university: university.name,

     university_id: university.id,

     research_result_id: researchResult.id,

     admission: verification.name || researchResult.name,

     verification_status: verification.verification_status,

     application_deadline: verification.application_deadline,

     international_deadline: verification.international_deadline,

     status: verification.status,

     confidence_score: verification.confidence_score,

    });

}



async function processPendingDeadlineVerifications(

    supabase: any,

    limit: number

){

    // Fetch the queue first. Keep this section deliberately simple so a

    // malformed response can never cause an "undefined.error" crash.

    let lookup: any;



    try {

     lookup = await supabase

      .from("research_queue")

     .select("*")

     .eq("task_type", "verify_deadline")

     .eq("status", "pending")

     .order("priority", { ascending: true })

     .order("created_at", { ascending: true })

     .limit(limit);

} catch (error) {

    const message = error instanceof Error ? error.message : String(error);

    console.error("Deadline queue lookup threw an exception:", error);

    return Response.json({

     success: false,

     action: "process_pending",

     task_type: "verify_deadline",

     error: `Deadline task lookup exception: ${message}`,

    }, { status: 500 });

}



if (lookup == null) {

    return Response.json({

     success: false,

     action: "process_pending",

     task_type: "verify_deadline",

     error: "Deadline task lookup returned no response object.",

    }, { status: 500 });

}



const lookupError = lookup.error;

if (lookupError) {

    const message = lookupError?.message ?? String(lookupError);

    return Response.json({

     success: false,

     action: "process_pending",

     task_type: "verify_deadline",

     error: `Deadline task lookup failed: ${message}`,

    }, { status: 500 });

}



const selected = Array.isArray(lookup.data) ? lookup.data : [];



if (selected.length === 0) {

    return Response.json({

     success: true,

     action: "process_pending",

     task_type: "verify_deadline",

     requested_limit: limit,

     selected: 0,

     processed: 0,

     succeeded: 0,

     failed: 0,

     results: [],

     message: "No pending deadline verification tasks.",

    });

}



const results: any[] = [];

// Process one task at a time. This reduces OpenAI rate-limit pressure and

// makes each failure independent of the other tasks in the batch.

for (const task of selected) {

 try {

  if (!task?.id) {

      throw new Error("Selected deadline task has no id.");

  }



  if (!task.country_id) {

      throw new Error(`Deadline task ${task.id} has no country_id.`);

  }



  let countryLookup: any;

  try {

      countryLookup = await supabase

      .from("countries")

      .select("*")

      .eq("id", task.country_id)

      .single();

  } catch (error) {

      const message = error instanceof Error ? error.message : String(error);

      throw new Error(`Country lookup exception for task ${task.id}: ${message}`);

  }



  if (countryLookup == null) {

      throw new Error(`Country lookup returned no response for task ${task.id}.`);

  }

  const countryError = countryLookup.error;

  if (countryError) {

      throw new Error(

     `Country lookup failed for task ${task.id}: ${countryError?.message ??
String(countryError)}`

      );

  }



  if (!countryLookup.data) {

      throw new Error(`Country ${task.country_id} was not found for task ${task.id}.`);

  }



  let source = null;



  if (task.source_id) {

      let sourceLookup: any;

      try {

          sourceLookup = await supabase

           .from("sources")

           .select("*")

           .eq("id", task.source_id)

           .single();

      } catch (error) {

          const message = error instanceof Error ? error.message : String(error);

          throw new Error(`Source lookup exception for task ${task.id}: ${message}`);

      }



      if (sourceLookup == null) {

          throw new Error(`Source lookup returned no response for task ${task.id}.`);

      }



      const sourceError = sourceLookup.error;

      if (sourceError) {

          throw new Error(

      `Source lookup failed for task ${task.id}: ${sourceError?.message ??
String(sourceError)}`

          );

      }



      source = sourceLookup.data ?? null;

  }



  const response = await runDeadlineVerification(

      supabase,

      task,

      countryLookup.data,

      source

  );



  if (response == null) {

      throw new Error(`Deadline verification returned no response for task ${task.id}.`);

  }



  const responseStatus = Number(response.status);

  if (!Number.isFinite(responseStatus) || responseStatus < 200 || responseStatus >=
300) {

      throw new Error(

    `Deadline verification returned HTTP ${Number.isFinite(responseStatus) ?
responseStatus : "unknown"} for task ${task.id}.`

      );

  }



  results.push({

      task_id: task.id,

      success: true,

      status_code: responseStatus,

  });

 } catch (error) {

  const message = error instanceof Error ? error.message : String(error);



  console.error(

      `Deadline verification batch failed for task ${task?.id ?? "unknown"}:`,

      error

  );



  if (task?.id) {

      try {

       const resetResult = await supabase

           .from("research_queue")

           .update({

            status: "pending",

            error_message: message,

            updated_at: new Date().toISOString(),

           })

           .eq("id", task.id);

                if (resetResult?.error) {

                    console.error(

                     `Could not reset failed deadline task ${task.id}:`,

                     resetResult.error.message

                    );

                }

            } catch (resetError) {

                console.error(

                    `Could not reset failed deadline task ${task.id}:`,

                    resetError

                );

            }

        }



        results.push({

            task_id: task?.id ?? null,

            success: false,

            status_code: 500,

            error: message,

        });

    }

}



const succeeded = results.filter((r) => r?.success === true).length;

const failed = results.length - succeeded;



return Response.json({

        success: failed === 0,

        action: "process_pending",

        task_type: "verify_deadline",

        requested_limit: limit,

        selected: selected.length,

        processed: results.length,

        succeeded,

        failed,

        results,

    });

}




// ======================================================

// PROGRAMME VERIFICATION

// ======================================================



async function runProgrammeVerification(

    supabase: any,

    task: any,

    country: any,

    source: any

){

    if (!task.research_result_id) {

        throw new Error(

         `Programme verification task ${task.id} has no research_result_id`

        );

    }

// --------------------------------------------------

// Get discovered programme

// --------------------------------------------------



const { data: researchResult, error: resultError } = await supabase

    .from("research_results")

    .select("*")

    .eq("id", task.research_result_id)

    .single();



if (resultError) {

    throw new Error(

     `Programme research result lookup failed: ${resultError.message}`

    );

}



if (researchResult.entity_type !== "programme") {

    throw new Error(

     `Research result ${researchResult.id} is not a programme result`

    );

}



// --------------------------------------------------

// Get university

// --------------------------------------------------



const { data: university, error: universityError } = await supabase

    .from("universities")

    .select("*")

    .eq("id", task.university_id)

    .single();



if (universityError) {

    throw new Error(

     `University lookup failed: ${universityError.message}`

    );

}



// --------------------------------------------------

// Get verification agent configuration

// --------------------------------------------------



const { data: agentConfig, error: configError } = await supabase

    .from("ai_agent_configs")

    .select("*")

    .eq("agent_name", "programme_verification_agent")

    .eq("active", true)

    .single();



if (configError) {

    throw new Error(

     `Programme verification agent configuration lookup failed: ${configError.message}`

    );

}

// --------------------------------------------------

// Mark task processing

// --------------------------------------------------



const { error: processingError } = await supabase

    .from("research_queue")

    .update({

     status: "processing",

     attempts: (task.attempts ?? 0) + 1,

     last_attempt_at: new Date().toISOString(),

     updated_at: new Date().toISOString(),

    })

    .eq("id", task.id);



if (processingError) {

    throw new Error(

   `Could not mark programme verification task as processing:
${processingError.message}`

    );

}



// --------------------------------------------------

// Create agent run

// --------------------------------------------------



const { data: agentRun, error: runError } = await supabase

    .from("agent_runs")

    .insert({

     research_queue_id: task.id,

     agent_name: "programme_verification_agent",

     run_type: "programme_discovery",

     status: "running",

    })

    .select()

    .single();



if (runError) {

    throw new Error(

     `Programme verification agent run creation failed: ${runError.message}`

    );

}



const existing = researchResult.extracted_data ?? {};



// --------------------------------------------------

// Official domains

// --------------------------------------------------



const allowedDomains = new Set<string>();



const addDomain = (url: string | null | undefined) => {

    if (!url) return;

    try {

     const hostname = new URL(url).hostname

         .toLowerCase()

         .replace(/^www\./, "");

     if (hostname) allowedDomains.add(hostname);

 } catch {

     // Ignore invalid URLs.

 }

};



addDomain(university.website_url);

addDomain(university.admissions_url);

addDomain(university.international_url);

addDomain(existing.programme_url);

addDomain(existing.application_url);

addDomain(existing.source_url);

addDomain(source?.url);



const officialDomains = Array.from(allowedDomains);



// --------------------------------------------------

// Prompt

// --------------------------------------------------



const userPrompt = `

Verify this academic programme using official sources.



Country:

${country.name} (${country.code})



University:

${university.name}

Official university website:

${university.website_url ?? ""}



Official admissions URL:

${university.admissions_url ?? ""}



Official international-student URL:

${university.international_url ?? ""}



Discovered programme name:

${researchResult.name}



Discovered programme data:

${JSON.stringify(existing, null, 2)}



Your task is PROGRAMME VERIFICATION ONLY.



Verify whether this exact programme is actually offered by this university.



Rules:

- Use the university's official website as the primary authority.

- Search the official admissions and international-student pages when relevant.

- An official national education/admissions source may support the finding but should
not replace a university source when the university page is available.

- Search for the specific programme page whenever possible.

- programme_url must be the specific official programme page when one can be
verified.

- Never use the university homepage as programme_url when a specific programme
page exists.

- Do not invent or guess URLs.

- If a specific programme page cannot be verified, programme_url must be empty.

- Preserve the exact official programme name when verified.

- Verify the degree level.

- Verify subject, field, duration, study mode, teaching language and tuition only when
published.

- Do not invent missing information.

- Do not infer that a programme is taught in English.

- Do not infer international eligibility.

- Do not add scholarship or deadline information.

- Do not verify specific PhD vacancies; those belong to the PhD research-position
workflow.

- If the programme exists but some details cannot be verified, use needs_review rather
than rejecting it.

- Use rejected only when reliable official evidence indicates the programme is not
offered or the discovered programme identity cannot be matched to the university.

- Confidence 0.90 or higher only when the programme identity is clearly verified from a
reliable official source.

- A missing specific programme URL normally means confidence below 0.90.



Return one verification result for this programme.

`;



 const webSearchTool: Record<string, unknown> = {

  type: "web_search",

  search_context_size: "high",

 };

if (officialDomains.length > 0) {

    webSearchTool.filters = {

        allowed_domains: officialDomains,

    };

}



// --------------------------------------------------

// OpenAI request

// --------------------------------------------------



const openAIResponse = await fetch(

    "https://api.openai.com/v1/responses",

    {

        method: "POST",

        headers: {

         "Content-Type": "application/json",

         Authorization: `Bearer ${OPENAI_API_KEY}`,

        },

        body: JSON.stringify({

         model: "gpt-5.6-luna",

         tools: [webSearchTool],

         tool_choice: "required",

         input: [

             {

                 role: "system",

                 content: agentConfig.system_instructions,

             },

             {

     role: "user",

     content: userPrompt,

 },

],

text: {

 format: {

     type: "json_schema",

     name: "programme_verification",

     strict: true,

     schema: {

      type: "object",

      properties: {

       verification: {

        type: "object",

        properties: {

          name: { type: "string" },

          degree_level: { type: "string" },

          subject: { type: "string" },

          field: { type: "string" },

          description: { type: "string" },

          duration: { type: "string" },

          study_mode: { type: "string" },

          language: { type: "string" },

          tuition_fee: { type: "string" },

          tuition_currency: { type: "string" },

          international_students: { type: "string" },

          programme_url: { type: "string" },

          application_url: { type: "string" },

 source_url: { type: "string" },

 confidence_score: { type: "number" },

 verification_status: {

     type: "string",

     enum: ["verified", "needs_review", "rejected"],

 },

 verification_notes: { type: "string" },

},

required: [

 "name",

 "degree_level",

 "subject",

 "field",

 "description",

 "duration",

 "study_mode",

 "language",

 "tuition_fee",

 "tuition_currency",

 "international_students",

 "programme_url",

 "application_url",

 "source_url",

 "confidence_score",

 "verification_status",

 "verification_notes",

],

additionalProperties: false,

                },

               },

               required: ["verification"],

               additionalProperties: false,

           },

          },

      },

     }),

 }

);



if (!openAIResponse.ok) {

 const errorText = await openAIResponse.text();



 await supabase

     .from("research_queue")

     .update({

      status: "pending",

      error_message: errorText,

      updated_at: new Date().toISOString(),

     })

     .eq("id", task.id);



 await supabase

     .from("agent_runs")

     .update({

      status: "failed",

      completed_at: new Date().toISOString(),

         error_message: `OpenAI API error ${openAIResponse.status}: ${errorText}`,

     })

     .eq("id", agentRun.id);



    throw new Error(

     `OpenAI API error ${openAIResponse.status}: ${errorText}`

    );

}



const openAIData = await openAIResponse.json();



const outputText =

    openAIData.output

     ?.find((item: any) => item.type === "message")

     ?.content

     ?.find((item: any) => item.type === "output_text")

     ?.text;



if (!outputText) {

    throw new Error(

     `OpenAI returned no output text. Raw response: ${JSON.stringify(openAIData)}`

    );

}



let verificationResponse: ProgrammeVerificationResponse;



try {

    verificationResponse = JSON.parse(outputText);

} catch {

    throw new Error(

     `Could not parse programme verification output: ${outputText}`

    );

}



const verification = verificationResponse.verification;



if (!verification) {

    throw new Error("Programme verification returned no verification result");

}



// Enforce the URL/confidence safety rule server-side as well.

if (!verification.programme_url) {

    verification.confidence_score = Math.min(

     verification.confidence_score,

     0.89

    );

}



// --------------------------------------------------

// Save verification result

// --------------------------------------------------



const mergedData = {

    ...existing,

    ...verification,

};

const { error: updateResultError } = await supabase

.from("research_results")

.update({

  name: verification.name || researchResult.name,

  source_url:

      verification.source_url ||

      researchResult.source_url ||

      null,

  extracted_data: mergedData,

  ai_summary:

      verification.description ||

      researchResult.ai_summary ||

      null,

  verification_status: verification.verification_status,

  confidence_score: verification.confidence_score,

  verified_at:

      verification.verification_status === "verified"

       ? new Date().toISOString()

       : null,

  updated_at: new Date().toISOString(),

 })

.eq("id", researchResult.id);



if (updateResultError) {

 throw new Error(

  `Failed to update programme verification result: ${updateResultError.message}`

 );

}



// --------------------------------------------------

// Verification log

// --------------------------------------------------



const logEntries = [

    {

        research_result_id: researchResult.id,

        verification_type: "official_source_check",

        result:

         verification.verification_status === "verified"

          ? "passed"

          : verification.verification_status === "rejected"

           ? "failed"

           : "needs_review",

        checked_url:

         verification.source_url ||

         verification.programme_url ||

         researchResult.source_url ||

         null,

        evidence: verification.verification_notes || null,

        notes: `Programme verification agent checked ${researchResult.name}.`,

    },

    {

        research_result_id: researchResult.id,

        verification_type: "data_completeness_check",

        result:

         verification.programme_url && verification.source_url

          ? "passed"

          : "needs_review",

     checked_url:

         verification.programme_url ||

         verification.source_url ||

         null,

   evidence: `Programme URL: ${verification.programme_url || ""}; source URL:
${verification.source_url || ""}`,

     notes: verification.verification_notes || null,

    },

];



const { error: logError } = await supabase

    .from("verification_log")

    .insert(logEntries);



if (logError) {

    console.error(

     "Programme verification log insert failed:",

     logError.message

    );

}



// --------------------------------------------------

// Complete queue task

// --------------------------------------------------

await supabase

 .from("research_queue")

 .update({

  status: "completed",

  updated_at: new Date().toISOString(),

  error_message: null,

 })

 .eq("id", task.id);



// --------------------------------------------------

// Complete agent run

// --------------------------------------------------



await supabase

 .from("agent_runs")

 .update({

  status: "completed",

  completed_at: new Date().toISOString(),

  results_found: 1,

  results_verified:

      verification.verification_status === "verified" ? 1 : 0,

  notes: `Programme verification status: ${verification.verification_status}.`,

 })

 .eq("id", agentRun.id);



  // Automatically publish verified programmes from ALL StudyBridge countries.
  // Publisher is service-role-only and checks verified official sources,
  // university domains, the degree level and existing catalogue entries.
  let publicationStatus = "Not published: programme verification is not verified";
  if (verification.verification_status === "verified") {
    try {
      const published = await supabase.rpc("publish_verified_programme", {
        p_result_id: researchResult.id
      });
      if (published?.error) {
        publicationStatus = "Publication failed; manual review required";
        console.error("Programme publication RPC error:", published.error.message);
      } else {
        publicationStatus = String(published?.data ?? "No publication result returned");
        if (publicationStatus.startsWith("Skipped:")) {
          console.warn("Programme publication skipped:", publicationStatus, "research_result_id", researchResult.id);
        }
      }
    } catch (publishError) {
      publicationStatus = "Publication failed; manual review required";
      console.error("Programme publication exception:", publishError);
    }
  }

return Response.json({

 success: true,

 task_id: task.id,

     agent_run_id: agentRun.id,

     task_type: "verify_programme",

     country: country.name,

     university: university.name,

     university_id: university.id,

     research_result_id: researchResult.id,

     programme: verification.name || researchResult.name,

     verification_status: verification.verification_status,

     programme_url: verification.programme_url,

     confidence_score: verification.confidence_score,
     publication_status: publicationStatus,

    });

}




// ======================================================
// BATCH PHD / FUNDED RESEARCH POSITION VERIFICATION
// ======================================================
async function processPendingPhDVerifications(supabase: any, limit: number) {
    const lookup = await supabase.from("research_queue").select("*")
        .eq("task_type", "verify_phd_position").eq("status", "pending")
        .order("priority", { ascending: true }).order("id", { ascending: true }).limit(limit);
    if (lookup == null) return Response.json({ success:false, error:"PhD verification queue lookup returned no response" }, {status:500});
    if (lookup.error) return Response.json({ success:false, error:`PhD verification queue lookup failed: ${lookup.error.message}` }, {status:500});
    const tasks = Array.isArray(lookup.data) ? lookup.data : [];
    if (!tasks.length) return Response.json({ success:true, action:"process_pending", task_type:"verify_phd_position", selected:0, processed:0, succeeded:0, failed:0, results:[] });

    const processOne = async (task:any) => {
        try {
            const c = await supabase.from("countries").select("*").eq("id", task.country_id).single();
            if (!c || c.error || !c.data) throw new Error(`Country lookup failed: ${c?.error?.message ?? "no response"}`);
            let source = null;
            if (task.source_id) {
                const s = await supabase.from("sources").select("*").eq("id", task.source_id).single();
                if (!s || s.error) throw new Error(`Source lookup failed: ${s?.error?.message ?? "no response"}`);
                source = s.data ?? null;
            }
            const response = await runPhDPositionVerification(supabase, task, c.data, source);
            if (!response || !response.ok) throw new Error(`PhD verification returned HTTP ${response?.status ?? "unknown"}`);
            return { task_id:task.id, success:true, status_code:response.status };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            try { await supabase.from("research_queue").update({status:"pending", error_message:message, updated_at:new Date().toISOString()}).eq("id",task.id); } catch {}
            return { task_id:task?.id ?? null, success:false, status_code:500, error:message };
        }
    };
    const settled = await Promise.allSettled(tasks.map(processOne));
    const results = settled.map((x:any,i:number)=>x.status === "fulfilled" ? x.value : ({task_id:tasks[i]?.id ?? null,success:false,status_code:500,error:String(x.reason)}));
    const succeeded = results.filter((x:any)=>x.success).length;
    return Response.json({ success:succeeded===results.length, action:"process_pending", task_type:"verify_phd_position", requested_limit:limit, selected:tasks.length, processed:results.length, succeeded, failed:results.length-succeeded, results });
}


// ======================================================
// BATCH PHD / FUNDED RESEARCH POSITION DISCOVERY
// ======================================================

async function processPendingPhDDiscoveries(
    supabase: any,
    limit: number
) {
    const { data: tasks, error: tasksError } = await supabase
        .from("research_queue")
        .select("*")
        .eq("task_type", "discover_phd_positions")
        .eq("status", "pending")
        .order("priority", { ascending: true })
        .order("id", { ascending: true })
        .limit(limit);

    if (tasksError) {
        throw new Error(`PhD discovery batch queue lookup failed: ${tasksError.message}`);
    }

    if (!tasks || tasks.length === 0) {
        return Response.json({
            success: true,
            action: "process_pending",
            task_type: "discover_phd_positions",
            requested_limit: limit,
            selected: 0,
            processed: 0,
            succeeded: 0,
            failed: 0,
            results: [],
            message: "No pending PhD/research-position discovery tasks.",
        });
    }

    const results: any[] = [];

    // Run sequentially to reduce OpenAI rate-limit pressure.
    for (const task of tasks) {
        try {
            const { data: country, error: countryError } = await supabase
                .from("countries")
                .select("*")
                .eq("id", task.country_id)
                .single();

            if (countryError) throw new Error(`Country lookup failed: ${countryError.message}`);

            let source = null;
            if (task.source_id) {
                const { data, error } = await supabase
                    .from("sources")
                    .select("*")
                    .eq("id", task.source_id)
                    .single();
                if (error) throw new Error(`Source lookup failed: ${error.message}`);
                source = data;
            }

            const response = await runPhDPositionDiscovery(supabase, task, country, source);
            results.push({
                task_id: task.id,
                success: response.ok,
                status_code: response.status,
                ...(response.ok ? {} : { error: `PhD discovery returned HTTP ${response.status}` }),
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            await supabase
                .from("research_queue")
                .update({
                    status: "pending",
                    error_message: message,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", task.id);
            results.push({ task_id: task.id, success: false, error: message });
        }
    }

    const succeeded = results.filter((item) => item.success).length;
    return Response.json({
        success: succeeded === results.length,
        action: "process_pending",
        task_type: "discover_phd_positions",
        requested_limit: limit,
        selected: tasks.length,
        processed: results.length,
        succeeded,
        failed: results.length - succeeded,
        results,
    });
}

// ======================================================
// PHD / FUNDED RESEARCH POSITION DISCOVERY
// ======================================================

async function runPhDPositionDiscovery(
    supabase: any,
    task: any,
    country: any,
    source: any
) {
    const { data: agentConfig, error: configError } = await supabase
        .from("ai_agent_configs")
        .select("*")
        .eq("agent_name", "phd_research_position_agent")
        .eq("active", true)
        .single();

    if (configError) {
        throw new Error(`PhD research-position agent configuration lookup failed: ${configError.message}`);
    }

    const { error: processingError } = await supabase
        .from("research_queue")
        .update({
            status: "processing",
            attempts: (task.attempts ?? 0) + 1,
            last_attempt_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            error_message: null,
        })
        .eq("id", task.id);

    if (processingError) {
        throw new Error(`Could not mark PhD discovery task as processing: ${processingError.message}`);
    }

    const { data: agentRun, error: runError } = await supabase
        .from("agent_runs")
        .insert({
            research_queue_id: task.id,
            agent_name: "phd_research_position_agent",
            run_type: "phd_discovery",
            status: "running",
        })
        .select()
        .single();

    if (runError) {
        await supabase.from("research_queue").update({
            status: "pending",
            error_message: runError.message,
            updated_at: new Date().toISOString(),
        }).eq("id", task.id);
        throw new Error(`PhD discovery agent run creation failed: ${runError.message}`);
    }

    const failTask = async (message: string) => {
        await supabase.from("research_queue").update({
            status: "pending",
            error_message: message,
            updated_at: new Date().toISOString(),
        }).eq("id", task.id);
        await supabase.from("agent_runs").update({
            status: "failed",
            completed_at: new Date().toISOString(),
            error_message: message,
        }).eq("id", agentRun.id);
    };

    const userPrompt = `
Research actual open or recently published doctoral research opportunities and funded PhD positions in ${country.name} (${country.code}).

Official starting source:
${source?.name ?? "Official source"}
${source?.url ?? "No source URL provided"}

Your task is PHD / DOCTORAL RESEARCH POSITION DISCOVERY ONLY.

Use the starting source as an official discovery point, but also search official university career/vacancy pages, doctoral schools, departments, research institutes, government research portals, and recognised official research-job portals in this country.

A general PhD programme or general doctoral admissions page is NOT a specific research position. Only return a record when there is evidence of a specific doctoral researcher, PhD candidate, doctoral student, funded PhD project, studentship, or equivalent research vacancy/opportunity.

For every position return:
- exact position title
- university
- research institution, if separately stated
- department or research group
- research area
- factual project/position description
- supervisor, only when officially stated
- funding type
- funding amount, only when officially published
- original funding currency
- salary, only when officially published
- eligibility requirements
- application opening date, only when explicitly published
- application deadline; if rolling/open until filled, preserve that wording in notes and leave deadline empty unless a date is published
- expected start date, only when explicitly published
- exact official source URL
- official application URL, when available
- status: open, closed, or unknown
- confidence score from 0 to 1
- short notes about uncertainty or special conditions

Important rules:
- Prefer official university, research institute, government, doctoral-school and recognised research-portal sources.
- Do not use commercial job/listing sites as final evidence.
- Do not invent positions, supervisors, projects, funding, salary, eligibility, dates, institutions or URLs.
- If a value is not officially published, return an empty string.
- Do not assume every PhD position is funded.
- Do not assume a general PhD programme is a vacancy.
- Confirm that a position is currently open before marking status open.
- If clearly expired or closed, mark status closed rather than open.
- If current status cannot be established reliably, use unknown.
- Preserve original currency and published salary/funding wording; do not convert or estimate.
- Avoid duplicates.
- Prefer the most specific official vacancy/project page as official_url.
- A confidence score of 0.90 or higher should only be used when the position identity, institution and current application status are strongly supported by official evidence.
`;

    const webSearchTool: Record<string, unknown> = {
        type: "web_search",
        search_context_size: "high",
    };

    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-5.6-luna",
            tools: [webSearchTool],
            tool_choice: "required",
            input: [
                { role: "system", content: agentConfig.system_instructions },
                { role: "user", content: userPrompt },
            ],
            text: {
                format: {
                    type: "json_schema",
                    name: "phd_position_discovery",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            positions: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        title: { type: "string" },
                                        university: { type: "string" },
                                        research_institution: { type: "string" },
                                        department: { type: "string" },
                                        research_area: { type: "string" },
                                        description: { type: "string" },
                                        supervisor: { type: "string" },
                                        funding_type: { type: "string" },
                                        funding_amount: { type: "string" },
                                        funding_currency: { type: "string" },
                                        salary: { type: "string" },
                                        eligibility: { type: "string" },
                                        application_open: { type: "string" },
                                        deadline: { type: "string" },
                                        start_date: { type: "string" },
                                        official_url: { type: "string" },
                                        application_url: { type: "string" },
                                        status: { type: "string", enum: ["open", "closed", "unknown"] },
                                        confidence_score: { type: "number" },
                                        notes: { type: "string" },
                                    },
                                    required: [
                                        "title", "university", "research_institution", "department",
                                        "research_area", "description", "supervisor", "funding_type",
                                        "funding_amount", "funding_currency", "salary", "eligibility",
                                        "application_open", "deadline", "start_date", "official_url",
                                        "application_url", "status", "confidence_score", "notes"
                                    ],
                                    additionalProperties: false,
                                },
                            },
                        },
                        required: ["positions"],
                        additionalProperties: false,
                    },
                },
            },
        }),
    });

    if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        const message = `OpenAI API error ${openAIResponse.status}: ${errorText}`;
        await failTask(message);
        throw new Error(message);
    }

    const openAIData = await openAIResponse.json();
    const outputText = openAIData.output
        ?.find((item: any) => item.type === "message")
        ?.content
        ?.find((item: any) => item.type === "output_text")
        ?.text;

    if (!outputText) {
        const message = `OpenAI returned no output text. Raw response: ${JSON.stringify(openAIData)}`;
        await failTask(message);
        throw new Error(message);
    }

    let researchResult: PhDPositionDiscoveryResponse;
    try {
        researchResult = JSON.parse(outputText);
    } catch {
        const message = `Could not parse PhD discovery output: ${outputText}`;
        await failTask(message);
        throw new Error(message);
    }

    const positions = researchResult.positions ?? [];
    let resultsSaved = 0;

    for (const position of positions) {
        // Discovery stays in research_results. It is not published to phd_positions
        // until a later verification workflow confirms the official evidence.
        const { error: insertError } = await supabase
            .from("research_results")
            .insert({
                research_queue_id: task.id,
                country_id: task.country_id,
                university_id: null,
                source_id: task.source_id,
                entity_type: "phd_position",
                name: position.title,
                source_url: position.official_url,
                official_source: true,
                extracted_data: position,
                ai_summary: position.description || position.notes,
                verification_status: "pending",
                confidence_score: position.confidence_score,
            });

        if (insertError) {
            console.error(`Failed to save PhD position ${position.title}:`, insertError.message);
            continue;
        }
        resultsSaved++;
    }

    await supabase.from("research_queue").update({
        status: "completed",
        updated_at: new Date().toISOString(),
        error_message: null,
    }).eq("id", task.id);

    await supabase.from("agent_runs").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        results_found: positions.length,
        results_verified: 0,
        notes: `Saved ${resultsSaved} PhD/research-position discovery results. Verification is still pending.`,
    }).eq("id", agentRun.id);

    return Response.json({
        success: true,
        task_id: task.id,
        agent_run_id: agentRun.id,
        task_type: "discover_phd_positions",
        country: country.name,
        source: source?.name ?? null,
        results_found: positions.length,
        results_saved: resultsSaved,
        verification_status: "pending",
    });
}

// ======================================================
// PHD / FUNDED RESEARCH POSITION VERIFICATION
// ======================================================
async function runPhDPositionVerification(supabase:any, task:any, country:any, source:any) {
    if (!task?.research_result_id) throw new Error(`PhD verification task ${task?.id ?? "unknown"} has no research_result_id`);
    const rr = await supabase.from("research_results").select("*").eq("id",task.research_result_id).single();
    if (!rr || rr.error || !rr.data) throw new Error(`PhD research result lookup failed: ${rr?.error?.message ?? "no response"}`);
    const researchResult = rr.data;
    if (researchResult.entity_type !== "phd_position") throw new Error(`Research result ${researchResult.id} is not a PhD-position result`);

    const cfg = await supabase.from("ai_agent_configs").select("*").eq("agent_name","phd_position_verification_agent").eq("active",true).single();
    if (!cfg || cfg.error || !cfg.data) throw new Error(`PhD verification agent lookup failed: ${cfg?.error?.message ?? "no response"}`);

    const processing = await supabase.from("research_queue").update({status:"processing",attempts:(task.attempts??0)+1,last_attempt_at:new Date().toISOString(),updated_at:new Date().toISOString(),error_message:null}).eq("id",task.id);
    if (!processing || processing.error) throw new Error(`Could not mark PhD verification task processing: ${processing?.error?.message ?? "no response"}`);

    const run = await supabase.from("agent_runs").insert({research_queue_id:task.id,agent_name:"phd_position_verification_agent",run_type:"phd_verification",status:"running"}).select().single();
    if (!run || run.error || !run.data) throw new Error(`PhD verification agent run creation failed: ${run?.error?.message ?? "no response"}`);
    const agentRun = run.data;
    const discovered = researchResult.extracted_data ?? {};
    const failTask = async (message:string) => {
        try { await supabase.from("research_queue").update({status:"pending",error_message:message,updated_at:new Date().toISOString()}).eq("id",task.id); } catch {}
        try { await supabase.from("agent_runs").update({status:"failed",completed_at:new Date().toISOString(),error_message:message}).eq("id",agentRun.id); } catch {}
    };

    const prompt = `Verify this specific PhD/doctoral researcher/funded research position using official sources.\nCountry: ${country?.name ?? ""} (${country?.code ?? ""})\nTitle: ${researchResult.name ?? discovered.title ?? ""}\nInstitution: ${discovered.university || discovered.research_institution || ""}\nOriginal URL: ${researchResult.source_url ?? discovered.official_url ?? ""}\nDiscovery data: ${JSON.stringify(discovered)}\n\nRules: Verify a specific doctoral/research vacancy, not a general PhD programme. Prefer the exact official university, department, research institute, careers/vacancies, doctoral-school, government, or recognised official research-job page. Never invent supervisor, funding, salary, eligibility, dates or URLs. Preserve rolling/open-until-filled wording in deadline. Closed real positions stay closed. Use verified when strong official evidence confirms identity and important details; needs_review for unresolved conflict/important ambiguity; rejected if it cannot be matched, is materially wrong/duplicate, or is only a general PhD programme. Missing optional fields alone do not require needs_review. Confidence >=0.90 only with strong official evidence. Current date: ${new Date().toISOString().slice(0,10)}.`;

    const ai = await fetch("https://api.openai.com/v1/responses", {method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${OPENAI_API_KEY}`},body:JSON.stringify({model:"gpt-5.6-luna",tools:[{type:"web_search",search_context_size:"medium"}],tool_choice:"required",input:[{role:"system",content:cfg.data.system_instructions},{role:"user",content:prompt}],text:{format:{type:"json_schema",name:"phd_position_verification",strict:true,schema:{type:"object",properties:{verification:{type:"object",properties:{title:{type:"string"},university:{type:"string"},research_institution:{type:"string"},department:{type:"string"},research_area:{type:"string"},description:{type:"string"},supervisor:{type:"string"},funding_type:{type:"string"},funding_amount:{type:"string"},funding_currency:{type:"string"},salary:{type:"string"},eligibility:{type:"string"},application_open:{type:"string"},deadline:{type:"string"},start_date:{type:"string"},official_url:{type:"string"},application_url:{type:"string"},status:{type:"string",enum:["open","closed","unknown"]},confidence_score:{type:"number"},notes:{type:"string"},verification_status:{type:"string",enum:["verified","needs_review","rejected"]},verification_notes:{type:"string"}},required:["title","university","research_institution","department","research_area","description","supervisor","funding_type","funding_amount","funding_currency","salary","eligibility","application_open","deadline","start_date","official_url","application_url","status","confidence_score","notes","verification_status","verification_notes"],additionalProperties:false}},required:["verification"],additionalProperties:false}}}}) });
    if (!ai.ok) { const m=`OpenAI API error ${ai.status}: ${await ai.text()}`; await failTask(m); throw new Error(m); }
    const aiData = await ai.json();
    const outputText = aiData.output?.find((x:any)=>x.type==="message")?.content?.find((x:any)=>x.type==="output_text")?.text;
    if (!outputText) { const m=`OpenAI returned no PhD verification output text`; await failTask(m); throw new Error(m); }
    let verification:any; try { verification=JSON.parse(outputText).verification; } catch { const m=`Could not parse PhD verification output: ${outputText}`; await failTask(m); throw new Error(m); }
    if (!verification) { const m="PhD verification response did not contain verification"; await failTask(m); throw new Error(m); }

    const upd = await supabase.from("research_results").update({name:verification.title||researchResult.name,source_url:verification.official_url||researchResult.source_url||null,official_source:true,extracted_data:verification,ai_summary:verification.description||verification.notes||researchResult.ai_summary||null,verification_status:verification.verification_status,confidence_score:verification.confidence_score,verified_at:verification.verification_status==="verified"?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq("id",researchResult.id);
    if (!upd || upd.error) { const m=`Failed to update PhD research result: ${upd?.error?.message ?? "no response"}`; await failTask(m); throw new Error(m); }

    const log = await supabase.from("verification_log").insert({research_result_id:researchResult.id,verification_type:"official_source_check",result:verification.verification_status==="verified"?"passed":verification.verification_status==="needs_review"?"needs_review":"failed",checked_url:verification.official_url||researchResult.source_url||null,evidence:verification.verification_notes,notes:verification.notes||verification.description||null});
    if (log?.error) console.error("PhD verification log failed:",log.error.message);

    let publishedPositionId:number|null=null;
    if (verification.verification_status === "verified") {
        let universityId = researchResult.university_id ?? task.university_id ?? null;
        if (!universityId && String(verification.university||"").trim()) {
            const u = await supabase.from("universities").select("id").eq("country_id",task.country_id).ilike("name",verification.university).limit(1).maybeSingle();
            if (u?.data?.id) universityId=u.data.id;
        }
        const numeric=(v:any)=>{const m=String(v??"").replace(/,/g,"").match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):null;};
        const date=(v:any)=>/^\d{4}-\d{2}-\d{2}$/.test(String(v??""))?v:null;
        const payload={university_id:universityId,title:verification.title,research_area:verification.research_area||null,department:verification.department||null,description:verification.description||null,supervisor:verification.supervisor||null,funding_type:verification.funding_type||null,funding_amount:numeric(verification.funding_amount),funding_currency:verification.funding_currency||null,salary:verification.salary||null,eligibility:verification.eligibility||null,application_open:date(verification.application_open),deadline:date(verification.deadline),start_date:date(verification.start_date),official_url:verification.official_url||null,application_url:verification.application_url||null,status:verification.status,last_verified:new Date().toISOString(),updated_at:new Date().toISOString()};
        let existing:any=null; if (verification.official_url) existing=await supabase.from("phd_positions").select("id").eq("official_url",verification.official_url).limit(1).maybeSingle();
        let pub:any; if (existing?.data?.id) { publishedPositionId=existing.data.id; pub=await supabase.from("phd_positions").update(payload).eq("id",publishedPositionId); } else { pub=await supabase.from("phd_positions").insert(payload).select("id").single(); if(pub?.data?.id) publishedPositionId=pub.data.id; }
        if (!pub || pub.error) { const m=`Could not publish verified PhD position: ${pub?.error?.message ?? "no response"}`; await failTask(m); throw new Error(m); }
    }

    const done=await supabase.from("research_queue").update({status:"completed",updated_at:new Date().toISOString(),error_message:null}).eq("id",task.id);
    if (!done || done.error) { const m=`Could not complete PhD verification task: ${done?.error?.message ?? "no response"}`; await failTask(m); throw new Error(m); }
    const runDone=await supabase.from("agent_runs").update({status:"completed",completed_at:new Date().toISOString(),results_found:1,results_verified:verification.verification_status==="verified"?1:0,error_message:null,notes:`PhD/research-position verification status: ${verification.verification_status}.`}).eq("id",agentRun.id);
    if(runDone?.error) console.error("PhD verification agent run completion failed:",runDone.error.message);
    return Response.json({success:true,task_id:task.id,agent_run_id:agentRun.id,task_type:"verify_phd_position",country:country?.name??null,research_result_id:researchResult.id,position:verification.title,verification_status:verification.verification_status,status:verification.status,deadline:verification.deadline,confidence_score:verification.confidence_score,phd_position_id:publishedPositionId});
}
