#!/usr/bin/env node
/**
 * mcp.ts - Spec Score MCP Server
 *
 * Score your specs before feeding them to an LLM.
 * A balanced spec produces balanced code.
 *
 * The LLM calling this tool IS the scorer.
 * Claude reads the spec, scores the 4 axes, and passes the scores to this tool.
 * The tool handles the math: normalization, balance, verdict, and visualization.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { scoreFromAxes, balanceLabel } from "./score.js";
import { generateRadarSVG, generateComparisonSVG } from "./visualize.js";

const axisSchema = {
  type: 'number' as const,
  minimum: 0,
  maximum: 1,
};

const tools = [
  {
    name: 'spec_score',
    description: `Score a spec/requirement on 4 axes. YOU (the LLM) read the spec and score it.

Score the spec on these 4 axes (each 0.0-1.0):
- completeness: Can an LLM understand the full scope? (0=vague idea, 1=complete with goal+context+criteria)
- clarity: Is it unambiguous? (0=multiple interpretations, 1=one clear interpretation)
- constraints: Are boundaries defined? (0=no limits, 1=clear scope and non-goals)
- specificity: Concrete testable details? (0=no testable criteria, 1=verifiable outcomes)

Also identify the weakest axis and give one tip to improve it.

The tool normalizes scores, calculates balance (0-1), and returns a verdict.
A balanced spec produces reliable LLM output. An unbalanced spec produces hallucinations.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string' as const, description: 'The spec text (for reference in the response)' },
        completeness: { ...axisSchema, description: 'Completeness score 0.0-1.0' },
        clarity: { ...axisSchema, description: 'Clarity score 0.0-1.0' },
        constraints: { ...axisSchema, description: 'Constraints score 0.0-1.0' },
        specificity: { ...axisSchema, description: 'Specificity score 0.0-1.0' },
        weakest: { type: 'string' as const, description: 'Which axis is weakest (biggest hallucination risk)' },
        tip: { type: 'string' as const, description: 'One concrete suggestion to improve the weakest axis' },
      },
      required: ['input', 'completeness', 'clarity', 'constraints', 'specificity', 'weakest', 'tip'],
    },
  },
  {
    name: 'spec_visualize',
    description: `Score a spec and generate an SVG radar chart. YOU (the LLM) read the spec and score it on 4 axes (0.0-1.0 each): completeness, clarity, constraints, specificity. Also identify weakest axis and tip.

The tool generates a radar chart: green = balanced (ready), yellow = moderate (gaps), red = spiked (blind spots).`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string' as const, description: 'The spec text (for reference)' },
        completeness: { ...axisSchema, description: 'Completeness score 0.0-1.0' },
        clarity: { ...axisSchema, description: 'Clarity score 0.0-1.0' },
        constraints: { ...axisSchema, description: 'Constraints score 0.0-1.0' },
        specificity: { ...axisSchema, description: 'Specificity score 0.0-1.0' },
        weakest: { type: 'string' as const, description: 'Weakest axis' },
        tip: { type: 'string' as const, description: 'Improvement tip' },
        title: { type: 'string' as const, description: 'Optional title above the chart' },
      },
      required: ['input', 'completeness', 'clarity', 'constraints', 'specificity', 'weakest', 'tip'],
    },
  },
  {
    name: 'spec_compare',
    description: `Side-by-side radar charts comparing two specs. YOU (the LLM) score BOTH specs on 4 axes each. Useful for before/after or good/bad examples.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        left: { type: 'string' as const, description: 'First spec text (left chart)' },
        left_completeness: { ...axisSchema, description: 'Left spec completeness' },
        left_clarity: { ...axisSchema, description: 'Left spec clarity' },
        left_constraints: { ...axisSchema, description: 'Left spec constraints' },
        left_specificity: { ...axisSchema, description: 'Left spec specificity' },
        left_weakest: { type: 'string' as const, description: 'Left spec weakest axis' },
        left_tip: { type: 'string' as const, description: 'Left spec tip' },
        right: { type: 'string' as const, description: 'Second spec text (right chart)' },
        right_completeness: { ...axisSchema, description: 'Right spec completeness' },
        right_clarity: { ...axisSchema, description: 'Right spec clarity' },
        right_constraints: { ...axisSchema, description: 'Right spec constraints' },
        right_specificity: { ...axisSchema, description: 'Right spec specificity' },
        right_weakest: { type: 'string' as const, description: 'Right spec weakest axis' },
        right_tip: { type: 'string' as const, description: 'Right spec tip' },
        left_title: { type: 'string' as const, description: 'Title for left chart' },
        right_title: { type: 'string' as const, description: 'Title for right chart' },
        title: { type: 'string' as const, description: 'Main title above both charts' },
      },
      required: [
        'left', 'left_completeness', 'left_clarity', 'left_constraints', 'left_specificity', 'left_weakest', 'left_tip',
        'right', 'right_completeness', 'right_clarity', 'right_constraints', 'right_specificity', 'right_weakest', 'right_tip',
      ],
    },
  },
];

const server = new Server(
  { name: 'spec-score', version: '2.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'spec_score': {
        const result = scoreFromAxes({
          completeness: args?.completeness as number,
          clarity: args?.clarity as number,
          constraints: args?.constraints as number,
          specificity: args?.specificity as number,
          weakest: args?.weakest as string,
          tip: args?.tip as string,
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              verdict: result.verdict,
              balance: result.balance,
              balance_label: balanceLabel(result.balance),
              axes: result.axes,
              weakest: result.details.weakest,
              strongest: result.details.strongest,
              tip: result.balance < 0.6
                ? `Your weakest axis is "${result.details.weakest}". Strengthen it to improve LLM output quality.`
                : result.balance < 0.75
                ? 'Almost there. Small improvements will make this spec reliable for LLM consumption.'
                : 'This spec is well-balanced. LLM output should be reliable.',
            }, null, 2),
          }],
        };
      }

      case 'spec_visualize': {
        const result = scoreFromAxes({
          completeness: args?.completeness as number,
          clarity: args?.clarity as number,
          constraints: args?.constraints as number,
          specificity: args?.specificity as number,
          weakest: args?.weakest as string,
          tip: args?.tip as string,
        });
        const svg = generateRadarSVG({
          values: result.vector,
          balance: result.balance,
          verdict: result.verdict,
          title: args?.title as string,
        });
        return { content: [{ type: 'text', text: svg }] };
      }

      case 'spec_compare': {
        const leftResult = scoreFromAxes({
          completeness: args?.left_completeness as number,
          clarity: args?.left_clarity as number,
          constraints: args?.left_constraints as number,
          specificity: args?.left_specificity as number,
          weakest: args?.left_weakest as string,
          tip: args?.left_tip as string,
        });
        const rightResult = scoreFromAxes({
          completeness: args?.right_completeness as number,
          clarity: args?.right_clarity as number,
          constraints: args?.right_constraints as number,
          specificity: args?.right_specificity as number,
          weakest: args?.right_weakest as string,
          tip: args?.right_tip as string,
        });
        const svg = generateComparisonSVG(
          {
            values: leftResult.vector,
            balance: leftResult.balance,
            verdict: leftResult.verdict,
            title: args?.left_title as string,
          },
          {
            values: rightResult.vector,
            balance: rightResult.balance,
            verdict: rightResult.verdict,
            title: args?.right_title as string,
          },
          args?.title as string,
        );
        return { content: [{ type: 'text', text: svg }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Spec Score MCP server running (v2 - LLM-native scoring)');
}

main().catch(console.error);
