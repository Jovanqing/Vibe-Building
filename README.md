<div align="center">

<h1>
<img src="assets/logo.svg" height="34" alt="" />&nbsp;Vibe Building
</h1>

**A deterministic physics engine, not a language model, decides whether a building design is accepted.**

Yongqing Jiang<sup>1†</sup>, Haoran Luo<sup>1*</sup>, Jianze Wang<sup>2</sup>, Xin Zhou<sup>1</sup>, Kaoshan Dai<sup>2</sup> &amp; Zhiqi Shen<sup>1*</sup>

<sup>1</sup>Nanyang Technological University, Singapore &nbsp;&nbsp; <sup>2</sup>Sichuan University, China

<sup>†</sup>Project leader. &nbsp;<sup>*</sup>Corresponding authors.

[![Project page](https://img.shields.io/badge/Project_page-live-0d8f85)](https://jovanqing.github.io/vibe-building/)
[![Paper](https://img.shields.io/badge/Paper-PDF-b31b1b)](https://jovanqing.github.io/vibe-building/paper.pdf)
[![Code](https://img.shields.io/badge/Code-not_released-lightgrey)](#release-plan)
[![VB-Bench](https://img.shields.io/badge/VB--Bench-not_released-lightgrey)](#release-plan)

[**Project page**](https://jovanqing.github.io/vibe-building/) &nbsp;|&nbsp;
[**Paper**](https://jovanqing.github.io/vibe-building/paper.pdf) &nbsp;|&nbsp;
[**Walkthrough**](https://jovanqing.github.io/vibe-building/story.html) &nbsp;|&nbsp;
[**Gallery**](https://jovanqing.github.io/vibe-building/gallery.html) &nbsp;|&nbsp;
[**BibTeX**](#citation)

<img src="assets/teaser.png" width="100%" alt="Five systems across four backbone LLMs on verified PASS, held-out seismic and held-out wind">

</div>

> [!NOTE]
> This repository is the landing page for the paper. **The code and VB-Bench are not public yet.**
> See [Release plan](#release-plan) for what is coming and in what order. Watch or star the
> repository to be notified.

## News

- **2026-10** &nbsp;Project page is live, with twenty-six buildings carried end to end through the pipeline: [jovanqing.github.io/vibe-building](https://jovanqing.github.io/vibe-building/)
- **2026-10** &nbsp;Paper submitted. The PDF is available from the project page.

## TL;DR

Most agents that design buildings produce models that look plausible but are never checked
against mechanics or against code. We introduce the **Vibe Building** task and **PE-Loop**
(Physics-Engine-in-the-Loop), an agent in which a deterministic physics engine is the only
source of evaluation signal. The language model proposes discrete revisions and pays nothing
for them. The physics engine decides, and every decision costs one evaluation of the budget.
Replacing that verdict with a language-model judge, with everything else held fixed, leaves
**58.43%** of accepted designs noncompliant.

## Abstract

Automated building design must comply with seismic and wind codes and satisfy structural
mechanics constraints, yet most existing agents produce visually plausible models without
verification grounded in mechanical analysis and code compliance. We introduce the Vibe
Building task and propose PE-Loop (Physics-Engine-in-the-Loop), an agent in which a
deterministic physics engine is the sole source of evaluation signals, mapping code
constraints to a physics process reward, while the language model is confined to proposing
discrete revisions (section menu, topology, and lateral system). Designs are verified by
held-out seismic and wind time-history checks and a constructability gate. On VB-Bench,
3,577 physics-adjudicated building instances across six code families, PE-Loop achieves the
highest verified success rate under three of four backbone LLMs, the highest held-out seismic
pass rate under all four, and the highest held-out wind pass rate under three. Replacing the
physics verdict with a language-model judge, all else fixed, leaves 58.43% of accepted designs
noncompliant. These results suggest that reliable structural design rests less on a stronger
LLM proposer than on an adjudicator the proposer cannot influence, a division of labor for
agents whose outputs must hold up in the physical world.

## Method

<div align="center">
<img src="assets/peloop.jpg" width="92%" alt="Overview of PE-Loop">
</div>

The meta level evolves discrete decisions (intent, system, strategy). The base level runs
continuous optimisation and deterministic assembly. Physics verification returns
parameter-level and topology-level feedback. The loop terminates only when every strength and
serviceability constraint holds.

## What the pipeline produces

Every model below was produced by the pipeline and rendered by the same Blender scene, from four
structural typologies that do not appear on the project page. The project page carries the other
twenty-two, each with its Rhino massing, its OpenSeesPy frame and its first mode shape.

<div align="center">

| | |
| :---: | :---: |
| <img src="assets/demo/torre_velasca.webp" width="330" alt="Brutalist castle keep tower turntable"><br>**Brutalist Castle Keep Tower** · 106 m<br>top-heavy overhang on a slender shaft | <img src="assets/demo/unite_habitation.webp" width="330" alt="Brutalist mega-slab residential turntable"><br>**Brutalist Mega-Slab Residential** · 59.5 m<br>long slab lifted on pilotis |
| <img src="assets/demo/johnson_wax_tower.webp" width="330" alt="Cantilevered tree tower turntable"><br>**Cantilevered Tree Tower** · 47 m<br>floors cantilevered off a central core | <img src="assets/demo/casa_del_fascio.webp" width="330" alt="Rationalist half-cube turntable"><br>**Rationalist Half-Cube** · 16.6 m<br>courtyard cut into a cubic volume |

[**See all twenty-six, with the full four-stage pipeline →**](https://jovanqing.github.io/vibe-building/#demos)

</div>

## Results

### Main table

Five agent systems run under four backbone LLMs on the topology-decision instances of the main
split, at effort tier `high`. Every arm receives the same instances, the same margin oracle and
the same budget, so the only thing that varies is the system. Arrows in the header give the
direction of improvement; ESC is unranked. The **PE-Loop** row is bolded in each block for
orientation; the paper additionally marks the best and second value per column.

| Arm | PASS ↑ | ESC | NFE@p ↓ | Exh. ↓ | Wall ↓ | T/O ↓ | pass³ ↑ | Valid ↑ | Seis. ↑ | Wind ↑ | Build ↑ | Verif. ↑ | P/h ↑ | Rank ↓ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **DeepSeek-V4-Flash** | | | | | | | | | | | | | | |
| Codex | 82.05±1.95 | 7.78±1.01 | 84.90±1.40 | 59.72±1.82 | 6.3 | 6.94±0.96 | 66.15±4.10 | 91.39±1.06 | 56.92±2.50 | 64.87±2.41 | 50.77±2.52 | 28.97±2.29 | 7.8 | 3.04 |
| Openclaw | 73.85±2.22 | 12.78±1.25 | 86.79±1.43 | 58.19±1.83 | 11.0 | 7.78±1.01 | 48.46±4.32 | 93.75±0.92 | 52.31±2.52 | 59.23±2.48 | 47.18±2.52 | 28.97±2.29 | 4.0 | 4.29 |
| DeepSeek Harness | 82.82±1.91 | 6.81±0.95 | 98.08±0.60 | 91.81±1.03 | 8.6 | 7.22±0.98 | 67.69±4.06 | 94.72±0.85 | 52.82±2.52 | 64.10±2.42 | 54.10±2.51 | 28.72±2.28 | 5.8 | 3.50 |
| Claude Code | 83.85±1.87 | 5.56±0.87 | 93.99±1.12 | 83.06±1.40 | 6.9 | 6.53±0.93 | 66.92±4.08 | 94.03±0.90 | 58.72±2.48 | 63.85±2.42 | 52.05±2.52 | 31.03±2.33 | 7.3 | 2.83 |
| **PE-Loop (ours)** | **91.28±1.45** | **11.39±1.19** | **62.51±0.38** | **2.09±0.31** | **1.6** | **1.67±0.51** | **68.46±4.03** | **98.89±0.43** | **60.77±2.46** | **70.00±2.31** | **46.41±2.51** | **35.64±2.42** | **34.2** | **1.33** |
| **Qwen3.8-Flash** | | | | | | | | | | | | | | |
| Codex | 14.10±1.77 | 34.31±1.77 | 28.24±5.08 | 13.47±1.28 | 13.4 | 18.89±1.46 | 2.31±1.64 | 56.39±1.84 | 13.33±1.73 | 14.10±1.77 | 12.56±1.69 | 12.05±1.66 | 0.6 | 3.83 |
| Openclaw | 32.56±2.36 | 1.11±0.43 | 98.72±0.50 | 42.92±1.84 | 30.0 | 56.11±1.84 | 7.69±2.47 | 54.31±1.85 | 20.00±2.03 | 24.62±2.18 | 20.77±2.05 | 10.51±1.57 | 0.7 | 4.50 |
| DeepSeek Harness | 65.90±2.39 | 3.61±0.72 | 83.88±1.47 | 30.42±1.71 | 23.2 | 27.08±1.65 | 40.00±4.24 | 77.50±1.56 | 39.49±2.46 | 50.00±2.52 | 42.56±2.49 | 19.49±2.01 | 1.7 | 2.67 |
| Claude Code | 56.15±2.50 | 12.50±1.24 | 80.25±1.57 | 17.08±1.40 | 17.1 | 16.39±1.38 | 31.54±4.03 | 68.19±1.73 | 30.51±2.32 | 42.05±2.49 | 37.44±2.44 | 12.82±1.71 | 2.0 | 2.75 |
| **PE-Loop (ours)** | **77.44±2.12** | **11.67±1.20** | **62.74±0.38** | **5.27±0.19** | **4.4** | **1.53±0.49** | **63.85±4.16** | **98.89±0.43** | **58.21±2.49** | **68.72±2.34** | **34.87±2.40** | **23.59±2.15** | **10.7** | **1.25** |
| **GLM 5.2 Fast** | | | | | | | | | | | | | | |
| Codex | 83.33±1.89 | 2.50±0.61 | 96.86±0.78 | 80.56±1.48 | 11.0 | 10.56±1.15 | 64.62±4.14 | 90.00±1.13 | 56.92±2.50 | 63.33±2.43 | 52.05±2.52 | 30.00±2.31 | 4.6 | 2.92 |
| Openclaw | 77.95±2.10 | 2.78±0.64 | 98.95±0.31 | 79.44±1.51 | 18.4 | 15.69±1.36 | 56.15±4.29 | 89.72±1.14 | 53.33±2.51 | 63.85±2.42 | 50.77±2.52 | 30.51±2.32 | 2.5 | 3.58 |
| DeepSeek Harness | 69.49±2.32 | 0.56±0.34 | 85.31±1.32 | 35.00±1.77 | 25.0 | 26.39±1.64 | 38.46±4.21 | 86.94±1.26 | 44.87±2.51 | 50.77±2.52 | 50.00±2.52 | 23.85±2.16 | 1.7 | 4.42 |
| Claude Code | 86.92±1.72 | 1.53±0.49 | 90.85±0.93 | 45.42±1.85 | 8.5 | 5.97±0.90 | 80.77±3.47 | 92.78±0.98 | 56.92±2.50 | 67.18±2.37 | 56.41±2.50 | 29.74±2.31 | 6.1 | 2.00 |
| **PE-Loop (ours)** | **76.92±2.13** | **10.42±1.15** | **63.31±0.39** | **6.41±0.24** | **2.5** | **1.11±0.43** | **63.85±4.16** | **96.25±0.73** | **59.23±2.48** | **66.92±2.37** | **40.00±2.47** | **27.18±2.25** | **18.3** | **2.08** |
| **Kimi K3** | | | | | | | | | | | | | | |
| Codex | 30.51±2.32 | 20.42±1.50 | 56.71±4.01 | 13.61±1.28 | 8.1 | 4.44±0.79 | 11.54±2.88 | 86.39±1.28 | 26.67±2.23 | 27.44±2.25 | 24.62±2.18 | 21.28±2.07 | 2.2 | 2.50 |
| Openclaw | 5.13±1.16 | 0.42±0.31 | 95.00±2.57 | 2.50±0.61 | 30.0 | 92.92±0.97 | 0.00±1.05 | 8.19±1.03 | 1.79±0.75 | 1.79±0.75 | 5.13±1.16 | 0.51±0.51 | 0.1 | 4.71 |
| DeepSeek Harness | 22.56±2.12 | 0.00±0.20 | 76.17±2.76 | 4.58±0.80 | 30.0 | 73.61±1.64 | 1.54±1.47 | 32.08±1.74 | 12.05±1.66 | 15.90±1.86 | 17.18±1.91 | 6.15±1.25 | 0.5 | 3.88 |
| Claude Code | 54.10±2.51 | 0.69±0.36 | 82.36±1.56 | 17.92±1.43 | 21.2 | 29.31±1.69 | 24.62±3.76 | 61.11±1.81 | 34.87±2.40 | 39.49±2.46 | 38.21±2.45 | 18.21±1.96 | 1.5 | 2.83 |
| **PE-Loop (ours)** | **83.08±1.90** | **7.64±1.00** | **63.07±0.33** | **0.00±0.19** | **4.5** | **2.50±0.61** | **74.62±3.80** | **97.64±0.59** | **61.54±2.45** | **71.03±2.29** | **43.33±2.50** | **28.21±2.27** | **11.0** | **1.08** |

<details>
<summary><b>Column glossary</b> (the paper gives full definitions and denominators in Appendix E)</summary>

| Column | Meaning |
| --- | --- |
| **PASS** | In-loop compliance: the design satisfies every strength and serviceability constraint. |
| **ESC** | Escaped: answers that left the loop without a verdict. Reported, not ranked. |
| **NFE@p** | Number of function evaluations spent to reach a pass. Lower is cheaper. |
| **Exh.** | Budget exhausted without a pass. |
| **Wall** | Wall-clock minutes per instance. |
| **T/O** | Timed out. |
| **pass³** | Passes on all three seeds of the same instance. Stability under resampling. |
| **Valid** | Answer is a well-formed, parseable design. |
| **Seis. / Wind** | Held-out time-history analysis: seismic and wind records never seen in the loop. |
| **Build** | Constructability gate. |
| **Verif.** | Certified success: passes every gate above, including both held-out checks. |
| **P/h** | Passes per hour. Throughput. |
| **Rank** | Mean rank across the ranked columns within the block. |

±&nbsp;is the Agresti–Coull standard error (standard error of the mean for NFE@p). Wall is in
minutes, P/h in passes per hour, every other column in percent. PASS, Seis., Wind, Build and
Verif. are over the 390 topology-decision answers per arm; ESC, Exh., T/O and Valid over all 720
answers; pass³ over the 130 instances.

</details>

### Who holds the verdict

The verdict is handed to a language-model judge that sees the brief, the code limits and the
design parameters but no simulator output. Everything else is fixed (Table 5 of the paper).

| Acceptance gate | Self-rep. PASS % | Verified PASS % ↑ | False-pos. % ↓ | Wasted NFE % ↓ | Jaccard ↑ | Wall s |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **Margin oracle (ours)** | 77.78 | **77.78** | **0.00** | **0.00** | 1.00 | 110.8 |
| LLM judge (same LLM) | 49.44 | 20.56 | 58.43 | 44.41 | 0.31 | 238.4 |
| LLM judge (stronger, disjoint) | 40.00 | 17.22 | 56.94 | 45.19 | 0.29 | 342.8 |

The two zeros on the first row are zero *by construction*, not for want of data: the gate of
the margin oracle is the physics check itself, so what it reports and what verification
confirms are the same quantity.

### Swapping the backbone

Because the verdict never depends on the proposer, the held-out pass rate barely moves when
the language model behind it changes. Spread across DeepSeek-V4-Flash, Qwen3.8-Flash,
GLM 5.2 Fast and Kimi K3:

| | PE-Loop | Best baseline |
| --- | ---: | ---: |
| Held-out seismic | **3.3 pp** | 23.8 pp |
| Held-out wind | **4.1 pp** | 27.7 pp |

### VB-Bench

3,577 physics-adjudicated building instances, 1,311 gradable tasks, six code families
(GB, EC8, ASCE 7, BSL, IS, NZS). Every code limit is traceable to the clause it comes from.

## Release plan

Ordered against the [ML Code Completeness Checklist](https://github.com/paperswithcode/releasing-research-code).
Nothing below is public yet; this section is the roadmap, and it is updated as items land.

- [ ] **VB-Bench instances** and the physics adjudication harness
- [ ] **PE-Loop** agent code (meta level, base level, margin oracle)
- [ ] **Structural-code knowledge base**: 86 codes, 625 cross-linked entries with clause provenance
- [ ] **Evaluation code** and the scripts that reproduce every table and figure in the paper
- [ ] **Held-out record libraries**: 44 FEMA P-695 far-field motions, 16 wind series
- [ ] **Pipeline exporters**: Rhino, Blender and OpenSeesPy artefacts shown on the project page

Release is gated on the review outcome. Opening an issue to ask about timing is welcome.

## What is in this repository today

This page, the figures above and four turntable animations. The other twenty-two buildings,
the full four-stage pipeline for each, and every experimental figure live on the
[project page](https://jovanqing.github.io/vibe-building/), which is built from the same
artefacts a pipeline run produces. No code, no model weights and no benchmark data are here yet.

## Citation

```bibtex
@inproceedings{jiang2027vibebuilding,
  title     = {Vibe Building},
  author    = {Jiang, Yongqing and Luo, Haoran and Wang, Jianze and
               Zhou, Xin and Dai, Kaoshan and Shen, Zhiqi},
  booktitle = {Submitted to the International Conference on Learning Representations},
  year      = {2027},
  note      = {Under review}
}
```

## Acknowledgements

The analysis core is built on [OpenSeesPy](https://github.com/zhuminjie/OpenSeesPy).
Geometry and rendering use [Rhino](https://www.rhino3d.com/) and [Blender](https://www.blender.org/).
The held-out seismic library draws on the FEMA P-695 far-field set and the PEER NGA-West2 database.

## Contact

Correspondence to [yong.qingjiang@outlook.com](mailto:yong.qingjiang@outlook.com).

## License

Not yet determined. A license will be stated when the code and VB-Bench are released. Until
then no license is granted for the contents of this repository.
