---
sidebar_position: 9
toc_max_heading_level: 2
---

import Memo from '@site/src/components/memo';

# [Arts Overdrive]

When performing an **\<Arts\>** skill check, a player may declare an **[Arts Overdrive]** to add **2 Bonus Dice** to the roll. If the resulting roll contains any **Error Dice (10)** or **Critical Dice (1)**, one or both of the following effects occur:
- The Arts Unit is damaged or destroyed.
- An **[Arts Backlash Check]** is triggered. The Danger Level for this check is equal to **twice the total number of Error Dice and Critical Dice** rolled in the Overdrive check.
  - **Note:** In this specific case, the Arts Backlash Check occurs even for characters who are **not** Infected.

<Memo>
Exerting Arts beyond their limits produces immense power—but such power always demands a fitting price.
</Memo>

## Example

### A character with [Physique: 2], [Luck: 3], [Erosion Level: 33] declares an [Arts Overdrive]. The dice result in 1, 10, 4, and 7, triggering an [Arts Backlash Check].

1. Physiological Resistance: `2 + 3 = 5`
2. Number of dice: `33 / 5 + 1 = 7` (rounded down)
3. Danger Level: Twice the sum of Error and Critical dice (`1 + 1 = 2` dice total), resulting in `2 * 2 = 4`

Result: `7DM<=4` (Roll 7D10; successes on 4 or less)

- If the Arts Backlash Check yields **0 successes**, there is no increase in Erosion Level.
- If it yields **4 successes**, the Erosion Level increases by **1D4+1**.

:::note
## Example Scene

A Resonator named Alto and his team are in a desperate situation under fire from a massive drone. Realizing the team is facing certain death at this rate, the player declares an **[Arts Overdrive]** for Alto’s Arts.

Alto’s **[Mind]** is 6, and his **\<Arts: Poltergeist\>** skill level is 2. Including the 2 Bonus Dice, the player rolls 4D10. The results are **1, 10, 4, and 1**. With a check value of `6 + 2 = 8`, the total success count is **4**.

Because of the extreme dice results, the Dealer describes Alto’s Arts Unit shattering, with shards piercing his hand. The Dealer then calls for an **[Arts Backlash Check]**. The Danger Level is **6** (three dice were either 1 or 10; `3 * 2 = 6`).

**Arts Backlash Check (Danger Level: 6)**

Alto is currently uninfected (**Erosion Level: 0**). The number of dice for his check is `1`, and the Danger Level is `6`. The player rolls 1D10 and gets a **4**. This results in **1 success**, so the player increases Alto’s **[Erosion Level]** by 1.

Alto has now become an **Infected**. However, through the immense power of his Arts, he levitated massive debris to block the drone's assault and slammed it back into the drone, dealing massive damage.
:::
