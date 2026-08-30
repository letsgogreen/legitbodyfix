-- Seed the user-owned backend with the 16 canonical Notion recipe records that
-- previously existed only in the Lovable-connected backend. The source row marked
-- “Duplicate / Merge” is intentionally excluded. All new rows remain review drafts.
-- Source: Notion “Corrective Exercise Recipe Library”, read 2026-08-30.

INSERT INTO public.recipes (
  notion_page_id, notion_url, title, slug, goal, summary, instructions,
  regions, movement_functions, symptoms_goals, progression_level, dosage,
  session_minutes, assessment_clues, safety_notes, evidence, equipment,
  internal_notes, notion_status, review_status, featured, published,
  last_reviewed_at, last_synced_at
) VALUES
  ('1f6effb2-9211-8006-9a45-f6e2556efcc0','https://app.notion.com/p/1f6effb2921180069a45f6e2556efcc0','Asymmetric weight shift','asymmetric-weight-shift','scoliosis','Observe whether the trunk or pelvis shifts consistently to one side in squat, step, gait, or quiet stance. Re-test after a low-risk mobility or control drill; treat the response as a clue, not a diagnosis.','## Overhead squat screening results
---
-
[Notion image — replace in admin]
## Tight muscles
---

<unknown url="https://app.notion.com/p/1f6effb2921180069a45f6e2556efcc0#1f8effb2921180248da6d7c4ac2c3482" alt="button"/>

<details>
<summary>Opposite side piriformis</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>

<details>
<summary>Elevated side TFL</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>

<details>
<summary>Elevated side adductors</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>

<details>
<summary>Elevated side QL</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>




## Weakened muscles
---
<columns>
	<unknown url="https://app.notion.com/p/1f6effb2921180069a45f6e2556efcc0#1f8effb29211809f82c7f36f2046b0a3"/>
	<unknown url="https://app.notion.com/p/1f6effb2921180069a45f6e2556efcc0#1f8effb292118041a0abc483a8d0a270"/>
	<unknown url="https://app.notion.com/p/1f6effb2921180069a45f6e2556efcc0#1f8effb2921180cd9366fe347e2ae806"/>
	<unknown url="https://app.notion.com/p/1f6effb2921180069a45f6e2556efcc0#1f8effb2921180988991f8806988024f"/>
</columns>
<unknown url="https://app.notion.com/p/1f6effb2921180069a45f6e2556efcc0#1feeffb2921180dd9773c37f208d7f6c" alt="button"/>

<details>
<summary>Muscle name</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective strengthening</summary>
	</details>
	
</details>

<details>
<summary>Muscle name</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>


---

-
## Instructions
---
[Notion image — replace in admin]
1. **Step**
	Massage
	
	heightened hip side
		- QL (Quadratus Lumborum)
		- TFL
		- adductor magnus
	opposite side
		- piriformis
		
2. **Step**
	- Step-up to overhead cable press (stepping up with opposite side foot)',ARRAY['hip-pelvis','spine-ribs']::text[],ARRAY['Balance / Weight Shift','Squat','Gait']::text[],ARRAY['scoliosis','left aic pattern','piriformis syndrome','Lower crossed syndrome']::text[],'control'::public.recipe_progression_level,'Choose 2–4 drills. Begin with 1–2 sets of 5–8 controlled reps or 20–30 seconds per side. Reassess the target task between stages.',15,'Observe whether the trunk or pelvis shifts consistently to one side in squat, step, gait, or quiet stance. Re-test after a low-risk mobility or control drill; treat the response as a clue, not a diagnosis.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Asymmetric weight shift can lead to several clinical disorders, including:

1. Lower Crossed Syndrome: This condition results from imbalances in muscle strength, typically characterized by tight hip flexors and weak glutes and abdominals.

2. Piriformis Syndrome: Tightness in the piriformis muscle can irritate the sciatic nerve, leading to pain in the buttock and down the leg.

3. Scoliosis: An asymmetric weight shift may contribute to spinal curvature, resulting in postural and functional issues.

4. Muscle Imbalances: Weakness in certain muscle groups and tightness in others can lead to chronic pain and dysfunction in movement patterns.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('375effb2-9211-8077-93dc-d148ca7a1799','https://app.notion.com/p/375effb29211807793dcd148ca7a1799','Excessive Anterior Pelvic Tilt','excessive-anterior-pelvic-tilt','Lordosis','Pelvis appears tipped forward during stance or squat, with possible rib flare or limited hip extension. Confirm by re-testing after a low-load control drill.','[Notion image — replace in admin]



## Instructions
---
1. TFL inhibition
2. IT band foam rolling
3. QL inhibition
4. Abdominal workout
5.',ARRAY['hip-pelvis','spine-ribs']::text[],ARRAY['Pelvic Control','Squat','Hinge']::text[],ARRAY['Lordosis','Disc heriation','Lower crossed syndrome']::text[],'control'::public.recipe_progression_level,'1–2 mobility drills plus 2 control or integration drills; 2–3 sets of 6–10 reps, stopping before compensation.',15,'Pelvis appears tipped forward during stance or squat, with possible rib flare or limited hip extension. Confirm by re-testing after a low-load control drill.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Excessive anterior pelvic tilt can lead to various clinical disorders, including lower back pain, hip pain, and knee pain. It may contribute to conditions such as disc herniation, lordosis, and lower crossed syndrome, which are characterized by muscle imbalances and altered biomechanics in the pelvic and lumbar regions.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('1f6effb2-9211-81ca-ab02-dacb7f4fdada','https://app.notion.com/p/1f6effb2921181caab02dacb7f4fdada','Excessive forward trunk leaning','excessive-forward-trunk-leaning',NULL,'Trunk inclines more than expected in a squat. Compare heel-elevated, arms-down, and supported squat variations to explore ankle, hip, trunk-control, or task-strategy contributions.','## Overhead squat screening results
---
[Notion image — replace in admin]
## Tight muscles {toggle="true"}
	---
	<unknown url="https://app.notion.com/p/1f6effb2921181caab02dacb7f4fdada#1f7effb2921180179895ff8d2cf2c0da" alt="alias"/>
	<synced_block url="https://app.notion.com/p/1f6effb2921181caab02dacb7f4fdada#1f7effb2921180df9303d4f3e5233edc">
		<synced_block_reference url="https://app.notion.com/p/1f6effb2921181caab02dacb7f4fdada#1f7effb2921180dc84eadc97c0e6d3e7">
			
			[Notion image — replace in admin]
			<details>
			<summary>functions</summary>
				- Extends the knee
				-  Flexes the hip
				- pelvic anterior tilt
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Origin : Anterior inferior iliac spine (AIIS) and the superior part of the acetabulum.
				- Insertion : Tibial tuberosity 
			</details>
			<details>
			<summary>Effective inhibition tools</summary>
				
			</details>
		</synced_block_reference>
	</synced_block>
	<unknown url="https://app.notion.com/p/1f6effb2921181caab02dacb7f4fdada#1f7effb29211801fa2ece2ab588702e0" alt="alias"/>
	<synced_block url="https://app.notion.com/p/1f6effb2921181caab02dacb7f4fdada#1f7effb292118065b848e9ed283256a4">
		<synced_block_reference url="https://app.notion.com/p/1f6effb2921181caab02dacb7f4fdada#1f7effb292118059a329e5876174d9a4">
			[Notion image — replace in admin]
			<details>
			<summary>functions</summary>
				- - Plantar flexion of the foot at the ankle joint
				- Flexion of the knee joint
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Insertion :  calcaneus via the Achilles tendon
				- Origin :  lateral and medial condyles of the femur
			</details>
			<details>
			<summary>Effective inhibition techniques</summary>
				
				
				
			</details>
			
			
		</synced_block_reference>
	</synced_block>
	<unknown url="https://app.notion.com/p/1f6effb2921181caab02dacb7f4fdada#1f7effb292118098b488c75283542462" alt="alias"/>
	<synced_block_reference url="https://app.notion.com/p/1f6effb2921181caab02dacb7f4fdada#1f7effb2921180fe84aacef147827f2f">
		[Notion image — replace in admin]
		<details>
		<summary>functions</summary>
			- Hip flexion
			- Hip abduction
			- Hip internal rotation
		</details>
		<details>
		<summary>Insertion & Origin</summary>
			- Origin: Anterior part of the iliac crest and the anterior superior iliac spine (ASIS)
			-  Insertion: Iliotibial band (ITB)
		</details>
		<details>
		<summary>Effective inhibition tools & techniques</summary>
			Massage ball with [ASMR ](/1f7effb29211800aaf32c10cd6f51abc?pvs=25)
			Foam rolling IT band
			
		</details>
		<details>
		<summary>Effective strengthening exercises</summary>
		</details>
	</synced_block_reference>
	
	<mention-page url="https://app.notion.com/p/1f7effb2921180068653f825e84c9921"/> 
	<details>
	<summary>functions</summary>
		- ankle extension
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Origin: Anterior part of the iliac crest and the anterior superior iliac spine (ASIS)
		-  Insertion: Iliotibial band (ITB)
	</details>
	<details>
	<summary>Effective inhibition tools & techniques</summary>
		Massage ball with [ASMR ](/1f7effb29211800aaf32c10cd6f51abc?pvs=25)
		Foam rolling IT band
		
	</details>
	<details>
	<summary>Effective strengthening exercises</summary>
	</details>
	



---

## Weakened muscles
---
<columns>
	<column ratio="43.75">
		[Notion image — replace in admin]
		<details>
		<summary>Muscle name</summary>
			<page url="https://app.notion.com/p/1f7effb29211803783c6d9bbd1aa6190">Muscle page (1)</page>
			<details>
			<summary>functions</summary>
				-
				-
				-
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Insertion :
				- Origin :
			</details>
			<details>
			<summary>Effective strengthening exercises</summary>
			</details>
			
		</details>
	</column>
	<column ratio="56.25">
		[Notion image — replace in admin]
		<details>
		<summary>Muscle name</summary>
			<page url="https://app.notion.com/p/1f7effb292118046ad3dc7188ffc395e">Muscle page (1)</page>
			<details>
			<summary>functions</summary>
				-
				-
				-
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Insertion :
				- Origin :
			</details>
			<details>
			<summary>Effective strengthening exercises</summary>
			</details>
			
		</details>
	</column>
</columns>

## Instructions
---

[Notion image — replace in admin]

1. **Step**
	-
2. **Step**
	-',ARRAY['ankle-foot','hip-pelvis','spine-ribs']::text[],ARRAY['Squat','Hinge']::text[],ARRAY[]::text[],'integration'::public.recipe_progression_level,'Use one drill for the most responsive constraint, then 2–3 sets of 5–8 tempo squats or hinges. Re-test the original squat after each block.',15,'Trunk inclines more than expected in a squat. Compare heel-elevated, arms-down, and supported squat variations to explore ankle, hip, trunk-control, or task-strategy contributions.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Excessive forward trunk leaning can lead to several clinical disorders, including lower back pain, muscular imbalances, postural dysfunction, and increased risk of injuries in the shoulder and neck areas. It may also contribute to conditions such as herniated discs and sciatica due to altered spinal mechanics.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('1f7effb2-9211-800f-87a2-e2e66a6566a1','https://app.notion.com/p/1f7effb29211800f87a2e2e66a6566a1','Excessive posterior tilt','excessive-posterior-tilt','flat back','Pelvis appears tucked under or lumbar curve reduces during stance or loaded movement. Check whether this is comfortable, task-specific, and modifiable before treating it as a target.','## Overhead squat screening results
---
[Notion image — replace in admin]
## Tight muscles
---
<columns>
	<column ratio="43.75">
		<unknown url="https://app.notion.com/p/1f7effb29211800f87a2e2e66a6566a1#1f7effb2921181cc8131e31dc862883d" alt="button"/>
		<details>
		<summary>New muscle</summary>
			<page url="https://app.notion.com/p/1f7effb29211810990fec7cdfa494e70">New muscle</page>
			<details>
			<summary>functions</summary>
				-
				-
				-
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Insertion :
				- Origin :
			</details>
			<details>
			<summary>Effective inhibition tools</summary>
			</details>
		</details>
		<details>
		<summary>New muscle</summary>
			<page url="https://app.notion.com/p/1f7effb292118180bbdcf993d78746f7">New muscle</page>
			<details>
			<summary>functions</summary>
				-
				-
				-
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Insertion :
				- Origin :
			</details>
			<details>
			<summary>Effective inhibition tools</summary>
			</details>
		</details>
		
		<unknown url="https://app.notion.com/p/1f7effb29211800f87a2e2e66a6566a1#1f7effb29211803cb362c729df44befd" alt="alias"/>
		<details>
		<summary>functions</summary>
			-
			-
			-
		</details>
		<details>
		<summary>Insertion & Origin</summary>
			- Insertion :
			- Origin :
		</details>
		<details>
		<summary>Effective inhibition tools</summary>
		</details>
		<unknown url="https://app.notion.com/p/1f7effb29211800f87a2e2e66a6566a1#1f7effb2921181a8a7c3d281cb6d3cfe" alt="button"/>
		
	</column>
	<column ratio="56.25">
		<details>
		<summary>Muscle name</summary>
			<page url="https://app.notion.com/p/1f7effb2921181c0b1e1f5163657635b">Muscle page (1)</page>
			<details>
			<summary>functions</summary>
				-
				-
				-
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Insertion :
				- Origin :
			</details>
			<details>
			<summary>Effective inhibition techniques</summary>
			</details>
			
		</details>
		
	</column>
</columns>
## Weakened muscles
---
<columns>
	<column ratio="43.75">
		[Notion image — replace in admin]
		<details>
		<summary>Muscle name</summary>
			<page url="https://app.notion.com/p/1f7effb2921181c99bd5c4c088153962">Muscle page (1)</page>
			<details>
			<summary>functions</summary>
				-
				-
				-
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Insertion :
				- Origin :
			</details>
			<details>
			<summary>Effective strengthening exercises</summary>
			</details>
			
		</details>
	</column>
	<column ratio="56.25">
		[Notion image — replace in admin]
		<details>
		<summary>Muscle name</summary>
			<page url="https://app.notion.com/p/1f7effb2921181adabc3fc690131dffc">Muscle page (1)</page>
			<details>
			<summary>functions</summary>
				-
				-
				-
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Insertion :
				- Origin :
			</details>
			<details>
			<summary>Effective strengthening exercises</summary>
			</details>
			
		</details>
	</column>
</columns>
## Instructions
---
1. **Step**
	-
2. **Step**
	-',ARRAY['hip-pelvis','spine-ribs']::text[],ARRAY['Pelvic Control','Squat','Hinge']::text[],ARRAY['flat back']::text[],'control'::public.recipe_progression_level,'1–3 drills; 2 sets of 6–10 slow reps. Progress only when breathing and trunk control remain comfortable.',12,'Pelvis appears tucked under or lumbar curve reduces during stance or loaded movement. Check whether this is comfortable, task-specific, and modifiable before treating it as a target.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Excessive posterior tilt can lead to several clinical disorders, including lower back pain, hip pain, and postural imbalances. It may also contribute to conditions such as herniated discs, sciatica, and knee pain due to altered biomechanics during movement. Additionally, it can impact athletic performance by reducing strength and stability in various activities.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('201effb2-9211-80a9-a2aa-ec6ce55d19d5','https://app.notion.com/p/201effb2921180a9a2aaec6ce55d19d5','Feet turn out','feet-turn-out',NULL,'Feet rotate outward during squat or gait. Compare comfortable stance width, ankle dorsiflexion, hip rotation, and foot-pressure control. Do not force feet straight if it causes pain or joint pinching.','## Overhead squat screening results
---

[Notion image — replace in admin]

## Tight muscles
---
<unknown url="https://app.notion.com/p/201effb2921180a9a2aaec6ce55d19d5#201effb29211818b88b5f7fdd2f333d7" alt="button"/>

<details>
<summary>Muscle name</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>

## Weakened muscles
---
<unknown url="https://app.notion.com/p/201effb2921180a9a2aaec6ce55d19d5#201effb2921181a88196fd30afa0c31a" alt="button"/>

<details>
<summary>Muscle name</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
		-
		-
		-
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective strengthening exercises</summary>
		
	</details>
	
</details>

## Instructions
---
[Notion image — replace in admin]

1. **Step**
	-
2. **Step**
	-',ARRAY['ankle-foot','knee','hip-pelvis']::text[],ARRAY['Squat','Gait','Foot Tripod / Arch']::text[],ARRAY[]::text[],'control'::public.recipe_progression_level,'2–3 drills; 1–3 sets of 6–10 reps. Use a stance that permits pain-free control, then narrow the change gradually if useful.',12,'Feet rotate outward during squat or gait. Compare comfortable stance width, ankle dorsiflexion, hip rotation, and foot-pressure control. Do not force feet straight if it causes pain or joint pinching.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Feet turning out can lead to various clinical disorders, including:

1. Ankle sprains: Due to improper alignment and increased stress on the ankle ligaments.
2. Knee pain or injuries: Such as patellar tendinitis or runner''s knee, caused by altered biomechanics.
3. Hip pain: Due to compensatory movements that can strain the hip muscles and joints.
4. Lower back pain: Resulting from altered posture and muscle imbalances.
5. Plantar fasciitis: Caused by excessive strain on the plantar fascia due to improper foot positioning.

Addressing muscle weaknesses and tightness associated with feet turning out is crucial to preventing these disorders.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('1f6effb2-9211-81a8-bc16-fab9da91eafa','https://app.notion.com/p/1f6effb2921181a8bc16fab9da91eafa','forward head posture','forward-head-posture','Upper crossed syndrome','Head sits forward relative to the trunk at rest or during reach. Check whether the position changes with thoracic support, breathing, visual focus, and low-load endurance work.','## Tool
---
- massage ball
- stability ball
## Instructions
---
[Notion image — replace in admin]



1. **Step**
	-
2. **Step**
	-',ARRAY['head-neck','spine-ribs','shoulder-arm']::text[],ARRAY['Postural Endurance','Overhead Reach','Scapular Control']::text[],ARRAY['Upper crossed syndrome','Layer cross syndrome','round shoulder','neck pain','rib flare']::text[],'control'::public.recipe_progression_level,'Short, frequent practice: 1–2 sets of 5–8 slow reps or 20–30-second holds, 1–3 times daily, without provoking headache, dizziness, or radiating symptoms.',10,'Head sits forward relative to the trunk at rest or during reach. Check whether the position changes with thoracic support, breathing, visual focus, and low-load endurance work.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Forward head posture can lead to various clinical disorders, including neck pain, headaches, shoulder pain, and upper back discomfort. It may also contribute to conditions such as thoracic outlet syndrome, temporomandibular joint (TMJ) disorders, and nerve impingement due to altered alignment of the cervical spine and surrounding musculature.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('1feeffb2-9211-805f-b4b3-e77a2df28042','https://app.notion.com/p/1feeffb29211805fb4b3e77a2df28042','Heel rise','heel-rise',NULL,'Heel lifts during squat or gait task. Compare supported squat, heel-elevated squat, knee-to-wall range, and foot-pressure control to identify a modifiable contributor.','## Overhead squat screening results
---

<columns>
	<column ratio="50">
		![Before](https://prod-files-secure.s3.us-west-2.amazonaws.com/9e480115-d206-4522-ab6a-8c1ef3233323/2699d492-4c94-4555-914c-b9d38d73a690/141.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4664IEA2H7R%2F20260830%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260830T073554Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEK%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJGMEQCIB%2FI5crdtWPDAWUv6BO71l2T6EzvV5A8WdCuaBgGhqFsAiBCEEHy6Rg9FmatDceIU4HWil45kqefqG2HNHDer7GqFCr%2FAwh4EAAaDDYzNzQyMzE4MzgwNSIMrL4Xd9EqKg0DYpaEKtwDItLMyR7gr20J0%2BBm9W6VTtcTIY%2F1kdKLA8zChiGgwa0P%2FlBzctkXNXn5R%2B0dRllP8k6Yz4aAxsdp3ubDgYe2jb%2BovDgXMFR4IIHuAc7NO5Ytw5P4lwKiOi1C5UI6ruVVAR%2FCcXsBo3bw9XQd3TFbAUUWRzomsIkjhGj8jHqZ4tigOY68jXOXGiVU2JiacG%2BYOS3BFE1YoxSWm4HvROk9QbsW0V2oRkblvtjbEg6T2IF3OQPzoiYN6f2xGxRoq8mMo5bb1AgEuruFWkc494ONL18D3oq0DM8OAXMPlpWQSE31cacz1UngKc%2BzuK94YGfIa8aYS3cmVGT0wtmQUFN1hkj0stiYnl9tyFgG8om3CznDoJ1h7Tx37YL%2B8v6sA9y5JUR7YX7MPzdqUByVoWwr8%2F%2B1iotvH%2BWeNSB4k%2BZ88w9uCXbQukyJFJjmJOFH1odsJZKLZWymyaDPxa3AU34t%2FlqWt5WJ4hmqu49fflHRPJuXed40TJDAaPj%2FhWsUL3GndIpFlA1iuFI65YZCibxZYsaQhzIvxFz830khxelZVu8gNZtkAVU%2B%2BUXzCpJsdKL5zxvKwBRQe1CFLwpMoniDJlvIlN%2FDXLlk2FDPmDa43GGF7VDoyZ%2Bo6R20XXsw9q7P1AY6pgG3LaBOq9iSM9VdJ4CIqKiQIBUDoluMa3Jy3RaTKPwmYPv%2FkWP39FxbgCHUcQuV0cOZH72O2EIy85x39HzQ6ZCGCqx0Oaz886f%2BqBkK2lqt3MtkS8jACRAbsNrTawYboNU8TdiG93H0ziVzopfNS%2BmnI411jzK8QjP%2Fuzk5CvRheR21sD%2BqyCykcH9Cmkm2vw6Frz944udpKp3MjFPeFZ5njFU3QkT6&X-Amz-Signature=30e60ac17e0f4dafcc6d8b497bc2ace2199507d605e443700de57fd34a3ce903&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)
	</column>
	<column ratio="50">
		![After](https://prod-files-secure.s3.us-west-2.amazonaws.com/9e480115-d206-4522-ab6a-8c1ef3233323/25ed9e78-6b50-4ad7-bdf0-e58caef5f126/142.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4664IEA2H7R%2F20260830%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260830T073554Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEK%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJGMEQCIB%2FI5crdtWPDAWUv6BO71l2T6EzvV5A8WdCuaBgGhqFsAiBCEEHy6Rg9FmatDceIU4HWil45kqefqG2HNHDer7GqFCr%2FAwh4EAAaDDYzNzQyMzE4MzgwNSIMrL4Xd9EqKg0DYpaEKtwDItLMyR7gr20J0%2BBm9W6VTtcTIY%2F1kdKLA8zChiGgwa0P%2FlBzctkXNXn5R%2B0dRllP8k6Yz4aAxsdp3ubDgYe2jb%2BovDgXMFR4IIHuAc7NO5Ytw5P4lwKiOi1C5UI6ruVVAR%2FCcXsBo3bw9XQd3TFbAUUWRzomsIkjhGj8jHqZ4tigOY68jXOXGiVU2JiacG%2BYOS3BFE1YoxSWm4HvROk9QbsW0V2oRkblvtjbEg6T2IF3OQPzoiYN6f2xGxRoq8mMo5bb1AgEuruFWkc494ONL18D3oq0DM8OAXMPlpWQSE31cacz1UngKc%2BzuK94YGfIa8aYS3cmVGT0wtmQUFN1hkj0stiYnl9tyFgG8om3CznDoJ1h7Tx37YL%2B8v6sA9y5JUR7YX7MPzdqUByVoWwr8%2F%2B1iotvH%2BWeNSB4k%2BZ88w9uCXbQukyJFJjmJOFH1odsJZKLZWymyaDPxa3AU34t%2FlqWt5WJ4hmqu49fflHRPJuXed40TJDAaPj%2FhWsUL3GndIpFlA1iuFI65YZCibxZYsaQhzIvxFz830khxelZVu8gNZtkAVU%2B%2BUXzCpJsdKL5zxvKwBRQe1CFLwpMoniDJlvIlN%2FDXLlk2FDPmDa43GGF7VDoyZ%2Bo6R20XXsw9q7P1AY6pgG3LaBOq9iSM9VdJ4CIqKiQIBUDoluMa3Jy3RaTKPwmYPv%2FkWP39FxbgCHUcQuV0cOZH72O2EIy85x39HzQ6ZCGCqx0Oaz886f%2BqBkK2lqt3MtkS8jACRAbsNrTawYboNU8TdiG93H0ziVzopfNS%2BmnI411jzK8QjP%2Fuzk5CvRheR21sD%2BqyCykcH9Cmkm2vw6Frz944udpKp3MjFPeFZ5njFU3QkT6&X-Amz-Signature=aa79fbecdf3d760388bf1fa0ebfa59a3188c905ef281061430d7d71d6787b36f&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)
	</column>
</columns>

 
## Tight muscles
---
<unknown url="https://app.notion.com/p/1feeffb29211805fb4b3e77a2df28042#1feeffb2921181f5a802da03c8c0b039" alt="button"/>

<details>
<summary>soleus</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>

<details>
<summary>gastrocnemius</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>

## Weakened muscles
---
<unknown url="https://app.notion.com/p/1feeffb29211805fb4b3e77a2df28042#1feeffb2921181b2ae47ea7d7f83b3ef" alt="button"/>

<details>
<summary>anterior tibilalis</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
		-
		-
		-
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective strengthening exercises</summary>
		
	</details>
	
</details>

## Instructions
---
[Notion image — replace in admin]

1. **Step**
	-
2. **Step**
	-',ARRAY['ankle-foot']::text[],ARRAY['Squat','Gait','Foot Tripod / Arch']::text[],ARRAY[]::text[],'mobility'::public.recipe_progression_level,'1 mobility drill plus 1 control drill; 2–3 sets of 6–10 reps or 30–45 seconds. Re-test the task without forcing the heel down.',10,'Heel lifts during squat or gait task. Compare supported squat, heel-elevated squat, knee-to-wall range, and foot-pressure control to identify a modifiable contributor.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Heel rises can lead to several clinical disorders, including:

1. Achilles tendonitis: Overuse or tightness in the calf muscles can increase strain on the Achilles tendon, leading to inflammation and pain.

2. Plantar fasciitis: Tightness in the calf muscles can affect foot mechanics, leading to increased tension on the plantar fascia and resulting in heel pain.

3. Shin splints: Weakness in the anterior tibialis can contribute to improper gait mechanics, causing pain along the shin due to overuse.

4. Knee pain: Imbalances in muscle strength and flexibility in the lower leg can lead to altered knee mechanics, resulting in pain or discomfort during activities.

5. Lower back pain: Tight calf muscles can affect pelvic positioning and lumbar spine alignment, potentially leading to discomfort or pain in the lower back.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('202effb2-9211-8099-8ece-c5158dba564a','https://app.notion.com/p/202effb2921180998ecec5158dba564a','Knee dominance','knee-dominance',NULL,'Knee-dominant strategy appears during squat, lunge, or landing. Determine whether it is painful or simply task-appropriate; compare hip-hinge, supported, and step-back variations.','## Overhead squat screening results
---

[Notion image — replace in admin]

## Tight muscles
---
<unknown url="https://app.notion.com/p/202effb2921180998ecec5158dba564a#202effb29211817794b2cbac012bb5ef" alt="button"/>

<details>
<summary>Muscle name</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>

## Weakened muscles
---
<unknown url="https://app.notion.com/p/202effb2921180998ecec5158dba564a#202effb2921181028922c47e0d502e90" alt="button"/>

<details>
<summary>Muscle name</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
		-
		-
		-
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective strengthening exercises</summary>
		
	</details>
	
</details>

## Instructions
---
[Notion image — replace in admin]

1. **Step**
	-
2. **Step**
	-',ARRAY['knee','hip-pelvis']::text[],ARRAY['Squat','Lunge / Step','Hinge']::text[],ARRAY[]::text[],'integration'::public.recipe_progression_level,'2–4 drills; 2–3 sets of 5–10 reps. Increase range or load only while the intended strategy remains comfortable and controlled.',15,'Knee-dominant strategy appears during squat, lunge, or landing. Determine whether it is painful or simply task-appropriate; compare hip-hinge, supported, and step-back variations.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Knee dominance can lead to several clinical disorders, including:
- Patellofemoral pain syndrome
- Iliotibial band syndrome
- Anterior cruciate ligament (ACL) injuries
- Tendonitis in the knee joint
- Osteoarthritis of the knee
- Muscle imbalances leading to overuse injuries','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('1fdeffb2-9211-80a7-8880-da69f62744b9','https://app.notion.com/p/1fdeffb2921180a78880da69f62744b9','Rib flare','rib-flare','scapula winging','Lower ribs appear prominent or move forward during breathing, overhead reach, or trunk effort. Check comfort, breathing expansion, and whether position changes with support and exhalation.','---

[Notion image — replace in admin]

## Tight muscles
---
<unknown url="https://app.notion.com/p/1fdeffb2921180a78880da69f62744b9#1fdeffb292118117aa96de85aceeb496" alt="button"/>

<details>
<summary>Muscle name</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>

<details>
<summary>Muscle name</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>

## Weakened muscles
---
<unknown url="https://app.notion.com/p/1fdeffb2921180a78880da69f62744b9#1fdeffb29211813a8eb0c66bf75458c8" alt="button"/>

<details>
<summary>Muscle name</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
		-
		-
		-
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective strengthening exercises</summary>
		
	</details>
	
</details>

## Instructions
---
[Notion image — replace in admin]

1. **Step**
	-
2. **Step**
	-',ARRAY['spine-ribs','hip-pelvis']::text[],ARRAY['Breathing / Rib Control','Overhead Reach','Postural Endurance']::text[],ARRAY['scapula winging','Layer cross syndrome']::text[],'control'::public.recipe_progression_level,'2–4 drills; 2 sets of 4–6 breaths or 6–10 reps. Keep effort low enough to avoid breath-holding, dizziness, or abdominal bulging.',12,'Lower ribs appear prominent or move forward during breathing, overhead reach, or trunk effort. Check comfort, breathing expansion, and whether position changes with support and exhalation.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Rib flare can lead to several clinical disorders, including:

1. Postural imbalances: Rib flare can disrupt the alignment of the spine and pelvis, leading to poor posture.
2. Scapular winging: This condition may occur due to weakened muscles around the shoulder blade, causing it to protrude.
3. Respiratory issues: Altered rib positioning can affect the mechanics of breathing, potentially leading to restricted lung function.
4. Chronic back pain: Imbalances caused by rib flare can contribute to discomfort and pain in the back and neck areas.
5. Muscle strain: Tight muscles associated with rib flare may lead to overuse injuries or strain in surrounding areas.

Addressing rib flare through targeted exercises and stretches can help mitigate these issues.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('1f6effb2-9211-8126-9541-ccb838f4b8bd','https://app.notion.com/p/1f6effb2921181269541ccb838f4b8bd','Round shoulder','round-shoulder','Layer cross syndrome','Shoulders rest or move forward during reach, push, or pull. Compare thoracic support, rib position, humeral rotation, and scapular control; avoid treating resting appearance alone.','## Overhead squat screening results
---

[Notion image — replace in admin]

## Tight muscles
---
<unknown url="https://app.notion.com/p/1f6effb2921181269541ccb838f4b8bd#202effb2921181e186e2f713234576a7" alt="button"/>

<details>
<summary>Muscle name</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>

## Weakened muscles
---
<unknown url="https://app.notion.com/p/1f6effb2921181269541ccb838f4b8bd#202effb2921181b6b4c2e91a3c969366" alt="button"/>

<details>
<summary>Muscle name</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
		-
		-
		-
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective strengthening exercises</summary>
		
	</details>
	
</details>

## Instructions
---
[Notion image — replace in admin]

1. **Step**
	-
2. **Step**
	-',ARRAY['shoulder-arm','spine-ribs','head-neck']::text[],ARRAY['Scapular Control','Overhead Reach','Push','Pull']::text[],ARRAY['Layer cross syndrome','Upper crossed syndrome','Shoulder impingement','round shoulder','Lower crossed syndrome','rib flare']::text[],'integration'::public.recipe_progression_level,'1 mobility drill plus 2 control or integration drills; 2–3 sets of 6–12 reps without pinching or radiating symptoms.',15,'Shoulders rest or move forward during reach, push, or pull. Compare thoracic support, rib position, humeral rotation, and scapular control; avoid treating resting appearance alone.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Round shoulders can lead to several clinical disorders, including shoulder impingement syndrome, postural dysfunctions such as upper crossed syndrome, neck pain, headaches, and thoracic outlet syndrome. Additionally, they may contribute to muscle imbalances and discomfort in the back and neck regions, affecting overall functional movement and performance.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('1f6effb2-9211-81ef-b583-c0b3f6fb111c','https://app.notion.com/p/1f6effb2921181efb583c0b3f6fb111c','Scapula anterior tilt','scapula-anterior-tilt','Shoulder impingement','Scapula tips forward or loses contact with the rib cage during arm elevation or pushing. Compare wall-supported, supine, and low-load reach variations.','## Overhead squat screening results
---
- Arms falling forward
[Notion image — replace in admin]
## Tight muscles
---
<columns>
	<column ratio="43.75">
		[Notion image — replace in admin]
		<details>
		<summary>Muscle name</summary>
			<page url="https://app.notion.com/p/1f7effb2921180ce96accb489538f2b3">Muscle page</page>
			<details>
			<summary>functions</summary>
				-
				-
				-
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Insertion :
				- Origin :
			</details>
			<details>
			<summary>Effective inhibition tools</summary>
			</details>
		</details>
		
	</column>
	<column ratio="56.25">
		[Notion image — replace in admin]
		<details>
		<summary>Muscle name</summary>
			<details>
			<summary>functions</summary>
				-
				-
				-
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Insertion :
				- Origin :
			</details>
			
		</details>
		
	</column>
</columns>
## Weakened muscles
---
<columns>
	<column ratio="43.75">
		[Notion image — replace in admin]
		<details>
		<summary>Muscle name</summary>
			
		</details>
	</column>
	<column ratio="56.25">
		[Notion image — replace in admin]
		<details>
		<summary>Muscle name</summary>
			
		</details>
	</column>
</columns>
---
-
-
## Instructions
[Notion image — replace in admin]
---
1. **Step**
	- Rib flare fix
	



1. **Step**
	- Pectoralis minor inhibition






1. **Step**
	- Serratus anterior exercise
	

1. Fix nearby joints based on RI 
	<unknown url="https://app.notion.com/p/1f6effb2921181efb583c0b3f6fb111c#200effb29211803e9ba3d02b22bd823f" alt="button"/>
 
<unknown url="https://app.notion.com/p/1f6effb2921181efb583c0b3f6fb111c#200effb2921180238472dbc7a4983edf" alt="button"/>',ARRAY['shoulder-arm','spine-ribs']::text[],ARRAY['Scapular Control','Overhead Reach','Push']::text[],ARRAY['Shoulder impingement','Upper crossed syndrome','Layer cross syndrome']::text[],'control'::public.recipe_progression_level,'2–3 drills; 2–3 sets of 6–12 controlled reps. Progress range before load and stop if shoulder pain increases.',12,'Scapula tips forward or loses contact with the rib cage during arm elevation or pushing. Compare wall-supported, supine, and low-load reach variations.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Scapula anterior tilt can lead to several clinical disorders, including shoulder impingement, upper crossed syndrome, and layer cross syndrome. These conditions often result from muscle imbalances where certain muscles become tight while others weaken, affecting shoulder stability and function.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('1f6effb2-9211-81a5-8c4b-c363496cf2af','https://app.notion.com/p/1f6effb2921181a58c4bc363496cf2af','shoulder elevation','shoulder-elevation','Shoulder impingement','One or both shoulders elevate early or remain elevated during reach. Compare unloaded reach, supported arm position, breathing, and scapular upward-rotation control.','[Notion image — replace in admin]

## Inhibit

---
- uppertrap
- pec minor
- levator scapulae
## Instructions
---
1. **Step**
	- lower trap exercises
2. **Step**
	- Serratus anterior exercise',ARRAY['shoulder-arm','head-neck','spine-ribs']::text[],ARRAY['Overhead Reach','Scapular Control','Postural Endurance']::text[],ARRAY['Shoulder impingement']::text[],'control'::public.recipe_progression_level,'1–3 drills; 2 sets of 6–10 reps or 20–30-second holds. Keep neck effort low and stop for numbness, tingling, or sharp pain.',12,'One or both shoulders elevate early or remain elevated during reach. Compare unloaded reach, supported arm position, breathing, and scapular upward-rotation control.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Shoulder elevation can be associated with several clinical disorders, including shoulder impingement syndrome, rotator cuff injuries, adhesive capsulitis (frozen shoulder), and scapular dyskinesis. These conditions may result from the imbalance between weakened and tight muscles around the shoulder, leading to pain and restricted movement.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('1f7effb2-9211-80cf-84e6-cc66c45ed0b9','https://app.notion.com/p/1f7effb2921180cf84e6cc66c45ed0b9','valgus foot','valgus-foot','Flat feet','Arch lowers or heel everts during stance, squat, or gait. Assess whether the change is flexible, comfortable, and responsive to foot-pressure or calf-control cues.','## Overhead squat screening results
---

[Notion image — replace in admin]



## Tight muscles
---
<unknown url="https://app.notion.com/p/1f7effb2921180cf84e6cc66c45ed0b9#1f7effb29211811fa07bca5dd6ec23dc" alt="button"/>

<details>
<summary><mention-page url="https://app.notion.com/p/1f7effb29211808c8689f39b9f8408ee"/> </summary>
	<synced_block_reference url="https://app.notion.com/p/1f7effb2921180cf84e6cc66c45ed0b9#1f7effb2921180fe84aacef147827f2f">
		[Notion image — replace in admin]
		<details>
		<summary>functions</summary>
			- Hip flexion
			- Hip abduction
			- Hip internal rotation
		</details>
		<details>
		<summary>Insertion & Origin</summary>
			- Origin: Anterior part of the iliac crest and the anterior superior iliac spine (ASIS)
			-  Insertion: Iliotibial band (ITB)
		</details>
		<details>
		<summary>Effective inhibition tools & techniques</summary>
			Massage ball with [ASMR ](/1f7effb29211800aaf32c10cd6f51abc?pvs=25)
			Foam rolling IT band
			
		</details>
		<details>
		<summary>Effective strengthening exercises</summary>
		</details>
	</synced_block_reference>
</details>

<details>
<summary><mention-page url="https://app.notion.com/p/1f7effb29211802ba522dfb4c9fb17c4"/> </summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>

<details>
<summary><mention-page url="https://app.notion.com/p/1f7effb2921180068653f825e84c9921"/> </summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>
<details>
<summary><mention-page url="https://app.notion.com/p/1f9effb292118045b18ceaf3f8b4c575"/> </summary>
</details>






## Weakened muscles
---
<unknown url="https://app.notion.com/p/1f7effb2921180cf84e6cc66c45ed0b9#1f8effb29211809ebc4ec8d705fdbcce" alt="button"/>


<details>
<summary><mention-page url="https://app.notion.com/p/394effb29211804697d7f3d08231a7c5"/> </summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
		-
		-
		-
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective strengthening exercises</summary>
		
	</details>
	
</details>

<details>
<summary><mention-page url="https://app.notion.com/p/393effb29211800c9e58c1c1f06efde2"/> </summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
		-
		-
		-
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective strengthening exercises</summary>
		
	</details>
	
</details>

<details>
<summary>Muscle name</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
		-
		-
		-
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective strengthening exercises</summary>
		
	</details>
	
</details>


## Instructions
[Notion image — replace in admin]
---
1. **Step**
	-
2. **Step**
	-
I understand you want different pages to have their own lists of tight muscles. While the JavaScript code you have aims to automatically sync the list, it won''t work in Notion. Instead, you can:
- Use Notion''s database relation property as you''re already doing - each page will automatically show its own related tight muscles in the property field
- Create a linked database view that filters to show only the tight muscles related to the current page
- If you need more advanced automation, you could explore using Notion''s API with an external application
These methods will maintain separate lists for different pages while staying within Notion''s built-in capabilities.',ARRAY['ankle-foot','knee']::text[],ARRAY['Foot Tripod / Arch','Gait','Squat']::text[],ARRAY['Flat feet']::text[],'control'::public.recipe_progression_level,'2–3 drills; 2–3 sets of 6–12 reps or 20–30-second balance holds. Preserve comfortable toe contact and breathing.',12,'Arch lowers or heel everts during stance, squat, or gait. Assess whether the change is flexible, comfortable, and responsive to foot-pressure or calf-control cues.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Plantar fasciitis, shin splints, knee pain (patellofemoral syndrome), hip pain, lower back pain, metatarsalgia.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('1f6effb2-9211-80cd-b7b3-efe4c7edbcd3','https://app.notion.com/p/1f6effb2921180cdb7b3efe4c7edbcd3','Valgus knee (knee collapsing inward)','valgus-knee-knee-collapsing-inward','X knee','Knee moves inward during squat, step, landing, or gait. Compare foot-pressure, hip-control, stance-width, and supported variations; judge by symptoms and task demands, not appearance alone.','---

## Kinesiological analysis
<columns>
	<column ratio="43.48">
		[Notion image — replace in admin]
	</column>
	<column ratio="56.52">
		[Notion image — replace in admin]
	</column>
</columns>
<columns>
	<column ratio="50">
		[Notion image — replace in admin]
	</column>
	<column ratio="50">
		[Notion image — replace in admin]
	</column>
</columns>

<columns>
	<column ratio="50">
		[Notion image — replace in admin]
	</column>
	<column ratio="50">
		[Notion image — replace in admin]
	</column>
</columns>
[Notion image — replace in admin]


## Surrounding muscles

<columns>
	<column ratio="50">
		[Notion image — replace in admin]
	</column>
	<column ratio="50">
		[Notion image — replace in admin]
	</column>
</columns>
<columns>
	<column ratio="50">
		[Notion image — replace in admin]
	</column>
	<column ratio="50">
		[Notion image — replace in admin]
	</column>
</columns>







## Instructions
[Notion image — replace in admin]

---
## inhibition {toggle="true"}
	###  TFL {toggle="true"}
		Relevance:
		<details>
		<summary>🧠 Tight TFL Dominating Gluteus Medius – Resulting Effects</summary>
			
			When the Tensor Fasciae Latae (TFL) becomes overactive or tight, it often dominates its synergist—the gluteus medius—which can lead to a cascade of biomechanical dysfunctions affecting the hip, knee, and lumbar spine.
			---
			🔄 Anatomy Recap
			Muscle	Action	Notes
			TFL	Hip flexion, internal rotation, abduction	Connects to the iliotibial band (ITB); easily over-recruited in compensation<br>Gluteus Medius	Hip abduction, pelvic stability	Primary lateral stabilizer of the pelvis in single-leg stance
			---
			🚨 What Happens When TFL Dominates Glute Med?
			✅ 1. Altered Hip Mechanics
			TFL prefers hip flexion + internal rotation, while glute med works best in neutral or slight external rotation.
			Overuse of TFL shifts femoral alignment → valgus knee stress, hip impingement risk.
			✅ 2. Pelvic Instability
			Glute med weakness leads to Trendelenburg sign (hip drop during gait).
			TFL compensates, but is ineffective at controlling the pelvis, especially during single-leg movements.
			✅ 3. Iliotibial Band (ITB) Tension
			TFL pulls on the ITB → increased lateral knee pain risk (e.g., ITB syndrome).
			ITB tightness can restrict hip and knee flexion and compress lateral structures.
			✅ 4. Lower Back Overload
			Reduced hip abduction control causes lumbar side-bending during gait or squats.
			Compensatory lumbar motion → QL (quadratus lumborum) and erector spinae overactivation → low back tightness or pain.
			---
			🛠️ Clinical Signs of TFL Dominance
			Observation	Possible Cause
			Knee valgus during squat/lunge	Glute med underactivation<br>Lateral hip tightness on palpation	Overactive TFL<br>ITB tightness or lateral knee pain	TFL-ITB tension chain<br>Hip drop during walking	Weak glute med, compensated by TFL
			
		</details>
		  
		[Notion image — replace in admin]
		**📌 Setup**
		- Use a massage ball
		- Position it under the TFL (front outer part of the hip, just below the ASIS)
		- Lie prone or slightly side-angled, with the TFL resting on the tool
		- Use your opposite leg and arms to support your body and control pressure
		**🔁**
		**One Full Movement Cycle**
		1. posterior tilt of the pelvic
		2. Hip External Rotation<br>→ Bend your knee and rotate your thigh outward, so your foot moves inward<br>→ This externally rotates the hip, putting the TFL on slight slack
		3. Extension<br>→ While maintaining external rotation, extend the hip by pushing the leg backward<br>→ Keep your pelvis stable — feel the glutes engage
		4. Adduction<br>→ From that position, move the leg inward toward the midline (toward the opposite leg)<br>→ You should feel the TFL stretching under pressure
		➡ Return to starting position and repeat the entire movement cycle 5–10 times, slowly and with control
		
		**⏱️ Tips**
		- repeat until the knot goes away
		- Keep your core engaged
		- Use vibrating massage ball works better at initial phase
		- inhibiting synergistic muscles like rectus femoris or sartorius might be needed 
		- If you feel asleep while doing it, do some bridges exercise until it wakes you up
		<details>
		<summary>**🎯 Why It Works**</summary>
			- TFL is a hip flexor, abductor, and internal rotator
			- This sequence uses the opposite actions (extension, adduction, external rotation) to:
				- Release muscle tension
				- Improve fascial mobility
				- Break down restrictions and overactivation
		</details>
	### adductors {toggle="true"}
		<br> 
		[Notion image — replace in admin]
		[Notion image — replace in admin]
		
		Relevance : Has direct impact adducting the femur
		<unknown url="https://app.notion.com/p/1f6effb2921180cdb7b3efe4c7edbcd3#23eeffb29211805ebf1fc90b600da872" alt="alias"/>
		
		
		Manual 
		
		
		<details>
		<summary>Hamstring tightness can restrict adductor stretchablity</summary>
			[Notion image — replace in admin]
			Hamstring tightness can increase global lower limb tension, heightening muscle spindle sensitivity in surrounding areas like the adductors.
			Inhibition lowers this tone, allowing the adductors to relax into a deeper stretch without triggering a protective reflex.
			🔍 Inference:
			The fascia connecting hamstrings and adductors (particularly via the ischial tuberosity and medial thigh lines) means tightness in one chain (e.g. hamstrings) can increase passive tension in another (e.g. adductors).
			The gracilis, a muscle of the adductor group, crosses the knee like the hamstrings and is subject to overlapping fascial and positional forces.
			✅ Conclusion: The text implies that tight hamstrings can create global lower body stiffness that affects the entire posterior and medial chain, including adductors.
			
			 
			
		</details>
	###  bicep femoris  {toggle="true"}
		
		[Notion image — replace in admin]
		[Notion image — replace in admin]
		Relevance :  
		<details>
		<summary>Why Inhibiting an Overactive Biceps Femoris Can Help Manage Knee Valgus?</summary>
			While the biceps femoris isn’t the root cause of knee valgus, it can contribute to dysfunctional movement patterns—especially when it becomes dominant over stabilizers like the gluteus medius and vastus medialis oblique (VMO).
			---
			🧠 Indirect Role in Knee Valgus:
			📌 1. Excessive Tibial External Rotation
			<br>
			[Notion image — replace in admin]
			The short head rotates the tibia laterally during flexion.
			In a valgus movement (medial knee collapse), the tibia may externally rotate while the femur internally rotates.
			This creates a twisting torque at the knee joint, worsening valgus stress on:
			ACL
			MCL
			Patellofemoral joint
			📌 2. Lateral Pull on Fibular Head
			Because it inserts on the fibular head, overactivity may increase lateral tension, pulling the knee outward below the joint, while the femur collapses inward.
			This misalignment contributes to valgus-like patterns, especially in dynamic tasks (e.g., landing, squatting).
			📌 3. Compensation for Weak Posterior Chain
			When glute max, glute med, or medial hamstrings (semitendinosus/semimembranosus) are weak, the biceps femoris short head may overfire to control movement.
			This reinforces lateral dominance, worsening the collapse of the medial chain
			
			Also has leverage for hip adduction <br>
			[Notion image — replace in admin]
		</details>
		
		
	### **vastus lateralis** {toggle="true"}
		[Notion image — replace in admin]
	### gastrocnemius leteral head {toggle="true"}
		[Notion image — replace in admin]
		
		Relevance :
		A tight lateral gastroc can indirectly affect:
		Lateral ankle tracking
		Pronation bias via fascial connections
		Increased stiffness affecting the biceps femoris pull
		The **lateral head of the gastrocnemius** can slightly assist with **external rotation of the tibia**, but only when the **knee is flexed**, since the tibia is unlocked and free to rotate in that position.
	### Fibularis complex (peroneals) {toggle="true"}
		<unknown url="https://app.notion.com/p/1f6effb2921180cdb7b3efe4c7edbcd3#23eeffb29211804ba9b8e5e3a29696bc" alt="alias"/>
		
		[Notion image — replace in admin]
		
		
		Relevance : Evert the foot can cause pronation (collapsing the arch) therefore resulting knee valgus
		<callout icon="💡" color="gray_bg">
			Restoring feet arch can be necessary following RI concept
		</callout>
		<unknown url="https://app.notion.com/p/1f6effb2921180cdb7b3efe4c7edbcd3#241effb292118024a8d2eb00104a2419" alt="alias"/>
		[Notion image — replace in admin]
		
		[Notion image — replace in admin]
		[Notion image — replace in admin]
		<unknown url="https://app.notion.com/p/1f6effb2921180cdb7b3efe4c7edbcd3#241effb2921180a780f0cd8dd13ee43f" alt="alias"/>
		<synced_block_reference url="https://app.notion.com/p/1f6effb2921180cdb7b3efe4c7edbcd3#23eeffb2921180e59d8fc7c380e026a6">
			<details>
			<summary>functions</summary>
				- Eversion of the foot (Think: the outer edge of the foot lifts up)
				- plantar flexion of the ankle 
					(peroneus tertius : dorsiflexion)
				- Abduction (moves foot laterally away from midline)
				
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Insertion : 
				- Origin :
			</details>
			<details>
			<summary>Effective inhibition tools</summary>
				
			</details>
		</synced_block_reference>
		
	
	[Notion image — replace in admin]
## Activate  {toggle="true"}
	
	## glute medius {toggle="true"}
		<br> 
		<unknown url="https://app.notion.com/p/1f6effb2921180cdb7b3efe4c7edbcd3#23feffb292118096b4b3cb8c3b715123" alt="alias"/>
		Relevance : Has crucial role for abduct the femur and prevent adductors getting overactivated.
		
		[Notion image — replace in admin]
		
		
		
		
		
	
	
	
	
	
	
	
	
	
	## glute maximus {toggle="true"}
		### Relevance : {toggle="true"}
			1. Hip External Rotation & Abduction
				Action: The glute max (especially the upper fibers) externally rotates and abducts the femur.
				 Knee valgus is often caused by femoral internal rotation and adduction. So the glute max counteracts this by pulling the femur outward and rotating it externally.
				Without strong glute max: The femur may drift inward → tibia follows → knee collapses medially.
				<br>
			2. Pelvic and Trunk Stability
				A weak glute max reduces pelvic stability, leading to compensatory movement patterns (e.g., pelvic drop, trunk lean), which in turn promote valgus collapse.
				
			3. Force Transfer During Movement
				During dynamic movements (running, cutting, jumping), the glute max helps absorb and transfer forces from the trunk to the lower limb.
				If the glute max is weak, the knee takes more of the load, which can encourage poor alignment like valgus collapse.
				<br>
			4. Controlling Femoral Kinematics
				Valgus knee is often not just a knee issue — it’s a hip control issue.
				The glute max, along with the glute medius, stabilizes the hip and controls femoral motion, helping align the knee over the foot.
			
		<br>
		
## Intergrate {toggle="true"}
	
	Supported squat with mini- band around knees
	<br>
	
	
	
	
<details>
<summary>References : </summary>
	<unknown url="https://app.notion.com/p/1f6effb2921180cdb7b3efe4c7edbcd3#23beffb2921180fcbdc5e18ec87a6529" alt="bookmark"/>
	
	
	
	
	
</details>

## Valgus-related pathologies

Pes anserinus syndrome
[https://www.physiocheck.co.uk/condition/133/pes-anserinus-syndrome](https://www.physiocheck.co.uk/condition/133/pes-anserinus-syndrome)',ARRAY['knee','hip-pelvis','ankle-foot']::text[],ARRAY['Squat','Lunge / Step','Gait']::text[],ARRAY['X knee','knock knee']::text[],'integration'::public.recipe_progression_level,'2–4 drills; 2–3 sets of 5–10 reps. Begin supported or unloaded and progress speed or load only with comfortable control.',15,'Knee moves inward during squat, step, landing, or gait. Compare foot-pressure, hip-control, stance-width, and supported variations; judge by symptoms and task demands, not appearance alone.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Valgus knee can lead to several clinical disorders, including:

1. Pes Anserinus Syndrome: Inflammation of the pes anserinus bursa, which can cause pain on the inner side of the knee.
2. Iliotibial Band Syndrome: Increased tension on the iliotibial band due to misalignment can cause lateral knee pain.
3. Patellar Tracking Issues: Abnormal knee mechanics may lead to misalignment and improper tracking of the patella, resulting in pain and dysfunction.
4. Anterior Cruciate Ligament (ACL) Strain: Increased stress on the ACL due to valgus collapse can lead to injury or strain.
5. Medial Collateral Ligament (MCL) Injury: Valgus stress on the knee can increase the risk of MCL injuries.
6. Chondromalacia Patella: Over time, improper alignment can lead to cartilage damage behind the kneecap.

These conditions highlight the importance of addressing valgus knee to prevent further complications.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('389effb2-9211-8040-8f06-ec619a085e32','https://app.notion.com/p/389effb2921180408f06ec619a085e32','varus foot','varus-foot',NULL,'Weight remains toward the lateral foot or heel appears inverted during stance or gait. Compare supported balance, foot-pressure cues, and ankle mobility without forcing pronation.','## Pathogenesis {toggle="true" color="orange"}
	Multiple theories have been proposed for the pathogenesis of pes <br>cavus. Duchenne described intrinsic muscle imbalances causing an <br>elevated arch. Other theories include the extrinsic muscle and a <br>combination of the intrinsic and extrinsic muscles being causes of the <br>imbalance
	Mann et al. (1992)[\[16\]](https://www.physio-pedia.com/Pes_Cavus#cite_note-16)<br> described the pathogenesis of pes cavus in patients with CMT disease. <br>An agonist and antagonist model for the muscles determines the <br>deformity. In CMT, the anterior tibialis muscle and the peroneus muscle <br>develop weaknesses. Antagonist muscles, [posterior tibialis](https://www.physio-pedia.com/Posterior_Tibial_Tendon_Dysfunction) and peroneus longus, pull harder than the other muscles, causing deformity. Specifically, the [peroneus longus](https://www.physio-pedia.com/Peroneus_longus_and_brevis_tests)<br> pulls harder than the weak anterior tibialis causing plantar flexion of<br> the first ray and forefoot valgus. The posterior tibialis pulls harder <br>than the weak peroneus brevis  causing forefoot adduction. Intrinsic <br>muscle develops contractures while the long extensor to the toes, <br>recruited to assist in ankle dorsiflexion, causes cock-up or claw toe <br>deformity. With the forefoot valgus and the hindfoot varus, increased <br>stress is placed on the lateral ankle ligaments and instability can <br>occur.[\[2\]](https://www.physio-pedia.com/Pes_Cavus#cite_note-:0-2)
## 병인 {toggle="true" color="orange"}
	Pes cavus의 병인에 대해서는 여러 이론이 제안되었습니다. Duchenne은 내재근(intrinsic muscle)의 불균형이 아치를 높인다고 설명했습니다. 다른 이론으로는 외재근(extrinsic muscle) 또는 내재근과 외재근의 복합적인 불균형이 원인이라는 의견도 있습니다.
	**Mann et al. (1992)**은 CMT disease (Charcot-Marie-Tooth disease) 환자에서 pes cavus의 병인을 설명했습니다. 근육의 **agonist-antagonist 모델**이 변형을 결정한다고 합니다.
	CMT에서는 **전경골근(anterior tibialis)**과 **비복근(peroneus muscle)**이 약해집니다. 이에 반해 길항근(antagonist muscles)인 **후경골근(posterior tibialis)**과 **장비복근(peroneus longus)**이 상대적으로 더 강하게 당겨 변형이 발생합니다.
	- 특히 **장비복근(peroneus longus)**이 약해진 전경골근보다 강하게 작용하여 **제1중**
	- **족골(first ray)**의 **족저굴곡(plantar flexion)**과 **전족부 외반(forefoot valgus)**을 일으킵니다.
	[Notion image — replace in admin]
	[Notion image — replace in admin]
	- **후경골근(posterior tibialis)**이 약해진 단비복근(peroneus brevis)보다 강하게 작용하여 **전족부 내전(forefoot adduction)**을 유발합니다.
	- 내재근(intrinsic muscles)은 구축(contracture)이 발생하고, 발목 배굴(dorsiflexion)을 돕기 위해 보상적으로 작용하는 **장족지신근(long extensor to the toes)**은 **망치족지(cock-up) 또는 조지(claw toe) 변형**을 일으킵니다.
	결과적으로 **전족부 외반**과 **후족부 내반(hindfoot varus)**이 함께 나타나면서 외측 발목 인대(lateral ankle ligaments)에 과도한 스트레스가 가해져 불안정성이 발생할 수 있습니다.
	
	[Notion image — replace in admin]
	**Deformities of the forefoot can create compensatory deformities in the hindfoot. <br>The reciprocal movement of the hindfoot in response to a forefoot <br>deformity is brought about by the foot functioning like a twisted plate.**
## Overhead squat screening results
---
[Notion image — replace in admin]

[Notion image — replace in admin]

## kinesiology {toggle="true" color="yellow"}
	[Notion image — replace in admin]
	[Notion image — replace in admin]
	[Notion image — replace in admin]
	[Notion image — replace in admin]
	[Notion image — replace in admin]
	[Notion image — replace in admin]

## Tight muscles
---

<details>
<summary><mention-page url="https://app.notion.com/p/370effb2921180e1bdfdc67b213bde2c"/>  </summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
		- plantarflexion
		- inversion
		- main dynamic stabilizer of the foot''s medial longitudinal arch
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion : tuberosity of navicular, all cuniforms
		- Origin : posterior surface of tibia and fibula and interosseous membrane
	</details>
	<details>
	<summary>Effective inhibitions</summary>
		[Tibialis Posterior Muscle Massage Video](https://www.youtube.com/watch?v=AMv0LzkMet8)
		[Tibialis Posterior Release - How to massage the inner shin](https://www.youtube.com/shorts/UiOKTqy4cdc)
		
	</details>
</details>

<details>
<summary><mention-page url="https://app.notion.com/p/393effb29211800c9e58c1c1f06efde2"/> </summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
		- Eversion 
		- plantar flexion of foot
		- maintains transverse arch
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion : Base of first metatarsal and medial cuneiform
		- Origin : Head and upper 2/3 of lateral surface of fibula
	</details>
	<details>
	<summary>Effective inhibitions</summary>
		
	</details>
	<details>
	<summary>Effective strengthening exercises</summary>
		
	</details>
</details>

<details>
<summary>foot intrinsic muscles</summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
	</details>
	
</details>

## Weakened muscles
---

<details>
<summary><mention-page url="https://app.notion.com/p/1f7effb2921180ff9d15e6ac6986ce3e"/> </summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
		-
		-
		-
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion :
		- Origin :
	</details>
	<details>
	<summary>Effective strengthening exercises</summary>
		
	</details>
	
</details>

<details>
<summary><mention-page url="https://app.notion.com/p/1f7effb29211804abb07c8da3de75fee"/> </summary>
	[Notion image — replace in admin]
	<details>
	<summary>functions</summary>
		-  Dorsiflexion of the foot
		-  Inversion of the foot
		- Support of the medial arch during walking and running
	</details>
	<details>
	<summary>Insertion & Origin</summary>
		- Insertion : The anterior tibialis muscle inserts onto the medial and plantar surfaces of the first cuneiform and the base of the first metatarsal.<br>
		- Origin : The anterior tibialis muscle originates from the lateral condyle and the upper two-thirds of the lateral surface of the tibia, as well as the interosseous membrane.
	</details>
	<details>
	<summary>Effective inhibition tools</summary>
		
	</details>
	<details>
	<summary>Effective strengthening exercises</summary>
		
	</details>
</details>

## Instructions
---

1. **Step**
	-
2. **Step**
	-',ARRAY['ankle-foot','knee']::text[],ARRAY['Foot Tripod / Arch','Gait','Balance / Weight Shift']::text[],ARRAY[]::text[],'control'::public.recipe_progression_level,'2–3 drills; 1–3 sets of 6–10 reps or 20–30-second supported holds. Stop for increasing lateral ankle pain or instability.',12,'Weight remains toward the lateral foot or heel appears inverted during stance or gait. Compare supported balance, foot-pressure cues, and ankle mobility without forcing pronation.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Clinical disorders that can result from a varus foot include hindfoot varus, forefoot valgus, lateral ankle ligament instability, peroneal tendon dysfunction, and compensatory forefoot deformities such as claw toe.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now()),
  ('1f6effb2-9211-80a6-a49a-c59f98564561','https://app.notion.com/p/1f6effb2921180a6a49ac59f98564561','Varus knee','varus-knee','Bow leg','Knee remains relatively outward during stance or movement. Compare foot-pressure, hip rotation, stance width, and task demands; do not promise structural change.','[Notion image — replace in admin]

## Overhead squat screening results
---
-
[Notion image — replace in admin]
## Tight muscles
---
<columns>
	<column ratio="43.75">
		[Notion image — replace in admin]
		<details>
		<summary>Muscle name</summary>
			<page url="https://app.notion.com/p/1f7effb2921180059622d264a467cfe4">Muscle page</page>
			<details>
			<summary>functions</summary>
				-
				-
				-
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Insertion :
				- Origin :
			</details>
			<details>
			<summary>Effective inhibition tools</summary>
			</details>
		</details>
		
	</column>
	<column ratio="56.25">
		[Notion image — replace in admin]
		<details>
		<summary>Muscle name</summary>
			<details>
			<summary>functions</summary>
				-
				-
				-
			</details>
			<details>
			<summary>Insertion & Origin</summary>
				- Insertion :
				- Origin :
			</details>
			
		</details>
		
	</column>
</columns>
## Weakened muscles
---
<columns>
	<column ratio="43.75">
		[Notion image — replace in admin]
		<details>
		<summary>Muscle name</summary>
			
		</details>
	</column>
	<column ratio="56.25">
		[Notion image — replace in admin]
		<details>
		<summary>Muscle name</summary>
			
		</details>
		
	</column>
</columns>
## Instructions

[Notion image — replace in admin]

---
1. **Step**
	-
2. **Step**
	-',ARRAY['knee','hip-pelvis','ankle-foot']::text[],ARRAY['Squat','Lunge / Step','Gait']::text[],ARRAY['Bow leg']::text[],'integration'::public.recipe_progression_level,'2–4 drills; 2–3 sets of 5–10 reps. Progress load only when the chosen pattern is comfortable and repeatable.',15,'Knee remains relatively outward during stance or movement. Compare foot-pressure, hip rotation, stance width, and task demands; do not promise structural change.','Stop and refer for new or worsening neurological symptoms, major trauma, unexplained swelling or fever, night pain that is severe or progressive, loss of bowel or bladder control, saddle numbness, chest pain, fainting, or rapidly declining function. Do not force painful range.',NULL,ARRAY[]::text[],'Clinical disorders that can be caused by varus knee include osteoarthritis, patellofemoral pain syndrome, and ligament injuries due to altered knee mechanics. Additionally, individuals may experience muscle imbalances leading to compensatory movements and potential lower back pain or hip dysfunction.','Needs Review','needs_data_review'::public.content_review_status,false,false,'2026-08-02',now())
ON CONFLICT (notion_page_id) DO UPDATE SET
  notion_url = EXCLUDED.notion_url,
  title = EXCLUDED.title,
  goal = EXCLUDED.goal,
  summary = EXCLUDED.summary,
  instructions = EXCLUDED.instructions,
  regions = EXCLUDED.regions,
  movement_functions = EXCLUDED.movement_functions,
  symptoms_goals = EXCLUDED.symptoms_goals,
  progression_level = EXCLUDED.progression_level,
  dosage = EXCLUDED.dosage,
  session_minutes = EXCLUDED.session_minutes,
  assessment_clues = EXCLUDED.assessment_clues,
  safety_notes = EXCLUDED.safety_notes,
  evidence = EXCLUDED.evidence,
  internal_notes = EXCLUDED.internal_notes,
  notion_status = EXCLUDED.notion_status,
  last_reviewed_at = EXCLUDED.last_reviewed_at,
  last_synced_at = EXCLUDED.last_synced_at,
  updated_at = now();

-- Existing publication/image state is deliberately preserved on conflict.

