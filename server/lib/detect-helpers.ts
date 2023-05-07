import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Configuration, OpenAIApi } from "openai";
import { pinecone } from "@/lib/pinecone_client";
import { render_prompt_for_pi_detection } from "@/lib/templates";
import stringSimilarity from "string-similarity";
import Custom_error from "@/lib/custom_error";
