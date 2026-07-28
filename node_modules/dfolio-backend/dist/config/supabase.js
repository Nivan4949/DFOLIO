"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUCKET_NAME = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qmicrfojlonziwnnhvpu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';
exports.supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
exports.BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'dfolio-photos';
