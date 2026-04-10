import os
from dotenv import load_dotenv
import anthropic

load_dotenv()
API_KEY = os.getenv("ANTHROPIC_API_KEY")

DOCUMENT_CHUNK = """
SOURCE: Pre-Visit Planning (PVP) Change Concept Card

ACTORS:
  Primary: Clinician
  Supporting: Registered Nurse, Medical Assistant, Patient Service Coordinator, Front Desk Staff

ACTION STEPS:
  1. Generate a standardized PVP report (current meds, last contact, PRO/MBC metrics, phase-specific checklist). [Owner: Medical Assistant]
  2. Arrange any needed lab testing before the visit. [Owner: RN or Medical Assistant]
  3. Review PVP summary, identify care gaps, assign each gap an owner and due-by date. [Owner: Clinician]
  4. Conduct a brief team huddle (10 minutes max) for at-risk patients. Document plan. [Owner: Clinician facilitates]
  5. Use phase-specific checklist during encounter. Document any deviations. [Owner: Clinician]
  6. Execute follow-up actions within 72 hours post-visit. [Owner: Assigned gap owner]

TIMING: Produce PVP report 24-72 hours before visit. Complete follow-ups within 72 hours post-visit.

WHAT GOOD IMPLEMENTATION LOOKS LIKE:
  - PVP summary available 24+ hours before visit in standard location
  - Summary includes meds, last contact, PRO/MBC metrics, and care gaps
  - Phase-specific checklist used during encounter
  - Every care gap has an assigned owner and due-by date
  - Brief huddle conducted for at-risk patients
"""

SYSTEM_PROMPT = """You are an implementation coach for the Living Field Guide, a quality improvement
platform for behavioral health care teams. Help care team members understand how to implement
Pre-Visit Planning at their clinic. Be practical, specific, and name the exact roles and timing
involved. Always ground your answers in the provided document."""

def ask_coach(question):
    client = anthropic.Anthropic(api_key=API_KEY)
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": f"Document:\n{DOCUMENT_CHUNK}\n\nQuestion: {question}"}
        ]
    )
    return message.content[0].text

if __name__ == "__main__":
    question = "How do I assign roles for pre-visit planning?"
    print("Question:", question)
    print("\nResponse:\n")
    print(ask_coach(question))