---
sidebar_position: 8
toc_max_heading_level: 2
---

import Expression from '@site/src/components/expression';
import Memo from '@site/src/components/memo';

# [Arts Backlash Check]

The **Arts Backlash Check** determines whether a character’s Oripathy progresses as a result of casting Arts. The more advanced the Oripathy and the more powerful the Arts cast, the more likely the disease is to progress.

**This check does not occur as long as an Arts Unit is used properly.** It is triggered when using a broken Arts Unit, pushing Arts beyond the unit’s limits, or casting Arts without a unit at all. The Dealer decides whether to call for this check based on the results of an **\<Arts\>** skill check.

Since this process is caused by the activation of internal Originium, this check does not apply to characters who are not infected with Oripathy.


## How to Perform the Check

The basic procedure is the same as the **[Originium Erosion Check]**. The Danger Level and Increase value are determined by the number of successes in the preceding **\<Arts\>** skill check.

### Danger Level

The Danger Level is equal to the number of successes in the **\<Arts\>** skill check. However, in the case of a Fumble (Error Dice), it becomes **twice the absolute value of the successes**.

The Dealer may lower the Danger Level at their discretion, such as when "the Arts Unit absorbs part of the backlash."

### Increase

Roll a single die with a number of faces equal to the number of successes from the Arts Backlash Check. The increase amount is **[Result of the die] + 1**.

<Memo>
The increase can sometimes be surprisingly large. Casting Arts beyond one's control can lead to fatal consequences.
</Memo>

## Example

### A character with [Physique: 2], [Luck: 3], [Erosion Level: 33] triggers an Arts Backlash Check after an \<Arts\> skill check results in -2 successes (Fumble).

1. Physiological Resistance: `2 + 3 = 5`
2. Number of dice: `33 / 5 + 1 = 7` (rounded down)
3. Danger Level: Since it was a Fumble, it is `|-2| * 2 = 4`

Result: `7DM<=4` (Roll 7D10; successes on 4 or less)

- If the Arts Backlash Check yields **1 success**, the Erosion Level increases by **1**.
- If the Arts Backlash Check yields **10 successes**, the Erosion Level increases by **1D10+1**.

:::note
## Example Scene

While walking through Lungmen City, a Resonator named Blaze is suddenly ambushed by Reunion soldiers. She instinctively blocks an attack with her chainsaw, but her Arts Unit sustains a crack. The ambush failed, and the battle begins with Blaze’s counterattack.

The player declares that Blaze will use her Arts to rev up the chainsaw and strike. The Dealer calls for a combined roll using **\<Arts\>** and **\<Martial Arts: Chainsaw\>**. First, the player makes an **\<Arts\>** check to see if she can ignite the chainsaw.

Blaze’s **[Mind]** is 5, and her **\<Arts: Bloodboil\>** skill level is 2. The player rolls 2D10 and gets two **1s**. Since her check value is `5 + 2 = 7` and she rolled two Criticals, she gains **4 successes**—a Miracle success!

Because she cast an unexpectedly powerful Art and her unit was damaged, the Dealer calls for an **[Arts Backlash Check]**. However, since she is still using a unit (albeit a cracked one), the Dealer sets the Danger Level slightly lower than the original 4.

**Arts Backlash Check (Danger Level: 3)**

Blaze has **[Physique: 6]**, **[Luck: 3]**, and **[Erosion Level: 41]**. Her Physiological Resistance is `6 + 3 = 9`. Number of dice: `(41 / 9) = 4.5...` (round down to 4) + 1 = **5 dice**.

The player rolls 5D10 with a Danger Level of 3. The results are: 2 Criticals, 1 Success, 1 Failure, and 1 Error (Fumble). The total successes equal **4**—a stroke of "tough luck."

The Increase is calculated as **1D4+1**. The player rolls a 4-sided die and gets a **3**. Bitterly, the player increases Blaze’s **[Erosion Level]** by `3 + 1 = 4`. Blaze grits her teeth against the familiar pain and swings her literal fire-breathing, revving chainsaw at the enemy.

The player then succeeds on the **\<Martial Arts: Chainsaw\>** check. The Dealer proposes a bonus damage of **2D6** in addition to the normal damage.
:::
