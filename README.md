<div align="center">

<img src="assets/logo.svg" width="78" alt="">

# Vibe Building

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

## Results

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

Only this page and its images. The twenty-six worked examples, the animations and all
experimental figures live on the [project page](https://jovanqing.github.io/vibe-building/),
which is built from the same artefacts a pipeline run produces.

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
