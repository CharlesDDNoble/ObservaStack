# Structure

1. **What It Does** (2-4 paragraphs)
   - Direct statement of purpose
   - Key capability or feature
   - How it works at highest level

2. **Why It Exists** (3-4 subsections with headers)
   - Each subsection = one fundamental reason/problem it solves
   - Start with the problem/need
   - Explain why this approach addresses it
   - Use concrete examples where helpful

3. **How It Works** (4-6 subsections with headers)
   - Break down into logical components
   - Focus on concepts, not implementation details
   - Show structure/organization visually (file trees, simple examples)
   - Explain flow/process at high level
   - Use minimal code snippets only to illustrate concepts clearly

4. **What This Enables** (4-5 subsections with headers)
   - Concrete use cases unlocked by the design
   - Show benefits through examples
   - Connect features to outcomes

5. **Design Principles / Limitations** (bulleted list)
   - Core philosophical decisions
   - Trade-offs made explicit
   - Format: "X over Y" or direct statements

6. **Summary** (1-2 paragraphs)
   - Restate core value proposition
   - Connect to larger vision/purpose
   - End with forward-looking statement

## Writing Style Rules

- **Lead with clarity**: Every section starts with the simplest, clearest statement.
- **Concrete over abstract**: Use specific examples, not generalizations. 
- **Data-Driven**: Reinforce points with concrete data and the source. Always measure and double check.
- **No jargon without definition**: If technical term is necessary, explain it immediately.
- **Active voice**: "The orchestrator executes" not "actions are executed".
- **Visual hierarchy**: Headers, bullets, code blocks create scannable structure.
- **Progressive detail**: Start high-level, add nuance in later sections.
- **Avoid hedging**: Say "does X" not "allows for doing X" or "enables X".
- **Short paragraphs**: 2-4 sentences max, one idea per paragraph.
- **Connect sections**: Each section flows logically from previous.

## Word Budget Constraints

- Total: <1000 words
- What: ~150 words
- Why: ~250 words
- How: ~300 words
- Enables: ~150 words
- Principles: ~50 words
- Example: ~50 words (mostly code)
- Outcomes: ~50 words
- Summary: ~50 words

This forces prioritization—only the most important ideas make the cut.

## Meta-Principle

**The doc should answer:**
1. What is this? (in 30 seconds)
2. Why does it exist? (what problem does it solve?)
3. How does it work? (conceptually, not implementation)
4. What can I do with it? (concrete capabilities)
5. Why these design choices? (trade-offs)
6. What does success look like? (outcomes)

Each section maps to one of these questions. If a paragraph doesn't clearly answer one, cut it. Respect people's time, be concise and explain from the top down, save the details for the code.