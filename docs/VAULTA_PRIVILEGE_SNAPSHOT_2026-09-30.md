# Vaulta Privileged-Account Snapshot

Observation date: 2026-09-30 UTC  
Status: **partial live-chain evidence; not an atomic state-history proof**

## Finding

The earlier statement that Vaulta's live 15-of-21 privilege graph was wholly unverified is superseded. A read-only query to Vaulta's documented public Chain API observed this current permission chain:

```text
15 of 21 active producer accounts
        -> eosio.prods@active
        -> eosio@active
        -> eosio.wrap@active and eosio.msig@active
```

`eosio.wrap` is currently marked privileged and exposes an `exec` action in its on-chain ABI. This establishes an installed privileged wrapper surface and a 15-of-21 authorization path to invoke its account permission. It does **not** by itself prove that the deployed WASM is byte-for-byte the upstream reference wrapper, nor prove every inner action effect. AEGIS has no deployed protected-state domain on this chain, and the snapshot does not prove an arbitrary table-write primitive.

## Chain And Finality Observations

Source endpoint: [`https://vaulta.greymass.com`](https://vaulta.greymass.com), documented by the [Vaulta Chain API](https://docs.eosnetwork.com/apis/spring/latest/chain.api/). Chain ID:

```text
aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906
```

An initial `get_info` response at head block `522956545` reported LIB `522956543`, ID `1f2baeff02419f8222fbe9994bac4b72b942d687a2292de6160a46ddad661301`, at `2026-09-30T17:28:05Z`. Account reads then occurred at their response head heights below. A later `get_info` reported head `522956725` and LIB `522956723`, ID `1f2bafb3516d82a4db2ea81e8aa0f2bbcecd0388da07dbbf436ac2f19cb524c9`, at `2026-09-30T17:29:35Z`. A separate `get_block_info(522956723)` returned the same LIB ID.

The account reads were at different block heights, not one atomic query at LIB 522956723. Their reported head blocks were subsequently below that endpoint's LIB. This is a post-hoc finality coverage check against one RPC provider, not a cryptographic state proof or a proof that all fields were read from the exact same state root. Hash and feature endpoints do not return a common state block. Treat this as strong discovery evidence, not a production-grade pinned checkpoint.

## Account And Permission Evidence

| Account | Read head | Observed state | Permission / code evidence |
|---|---:|---|---|
| `eosio` | `522956564` | `privileged=true`; `last_code_update=2025-07-15T16:02:28Z` | Both `owner` and `active` have threshold 1 and require `eosio.prods@active`. Code hash `34cbdf2a9c41b0a182f235018753110ca2cdcdd4c274b17dd8b7ea9f444fd043`; ABI hash `dbd704dd1b7df115cf9a4c31eb98dd1336476ea5642445aa00dc8f8bb4910abc`. |
| `eosio.prods` | `522956570` | `privileged=false` | `active`: threshold 15 across the 21 accounts below. `prod.major`: threshold 11 across the same set. `prod.minor`: threshold 8 across the same set. `owner`: threshold 1 with no keys, accounts, or waits in the returned authority. |
| `eosio.msig` | `522956585` | `privileged=true`; `last_code_update=2024-03-16T11:55:05.5Z` | Both `owner` and `active` require `eosio@active`. Code hash `9bddf7e0444a3a5f457f88509824ec8c46dcbedbf7b15ffdf6dd03d7f8ec33e8`; ABI hash `b71b5bb8b5a23a3f06d5e0129f8190f810843e11e66c4d0aea89ba8ef26c8fa7`. ABI actions: `approve`, `cancel`, `exec`, `invalidate`, `propose`, `unapprove`. |
| `eosio.wrap` | `522956593` | `privileged=true`; `last_code_update=2024-03-16T11:55:05.5Z` | Both `owner` and `active` require `eosio@active`. Code hash `ecb8e3a5e1841acb71067e886b1c50d647d54906b232beb725bd8ac331ad78bb`; ABI hash `91f40e096f1952ad61b02be1e02ade8a8866a8d032eecc80725fe2059e5fee8f`. ABI exposes action `exec`. |

The endpoint later returned these block IDs for the four account-read heights; all are below LIB `522956723` from the same provider:

| Account read | Block ID |
|---|---|
| `eosio` at `522956564` | `1f2baf1455873920e4cac8abda7567c7dfd08fe47e45f197d83ef873d2e12b4d` |
| `eosio.prods` at `522956570` | `1f2baf1acc2b645616dd5b475ce73bd4343d247eb4d8fa5a31f5e48e0dedb66f` |
| `eosio.msig` at `522956585` | `1f2baf298a7172f7e0af40afe7e24be376b13a47cab6c04d33f8f9e5d7828d35` |
| `eosio.wrap` at `522956593` | `1f2baf3180093da7419c903d6557d717d4e30c65815fc5780950960e17beb42a` |

The 21 accounts in `eosio.prods`'s returned authority exactly match the active producer schedule returned by `get_producer_schedule` (schedule version `2526`; no pending or proposed schedule in that response):

```text
alohaeosprod, big.one, binancestake, bp.1dex, bp.defi, cryptolions1,
eosasia11111, eoseyes.com, eosflytomars, eosiodetroit, eosiosg11111,
eosnationftw, eosphereiobp, eosriobrazil, eossupportbp, eostitanprod,
ivote4eosusa, metahubeosbp, newdex.bp, slowmistiobp, starteosiobp
```

`eosio`'s live ABI includes `setcode`, `setabi`, `updateauth`, `setpriv`, `setparams`, `setalimits`, and other system actions. This is action-surface evidence, not a complete action-to-permission proof. In the observed account graph, an authorization requiring `eosio@active` or `eosio.wrap@active` can be satisfied by the 15-of-21 producer authority. The precise auth level and contract/native semantics must still be traced for each mutation path.

## Consensus And Software Observations

- `get_activated_protocol_features` included builtin feature `SAVANNA`, activation ordinal 22 at block `396090329`; the response contained 23 activated features (ordinals 0 through 22).
- The queried API node reported `server_version_string=v1.0.5` and full version `v1.0.5-b0ae2a6f43305e2e69ce4f81ab4eaa98a9d23e09`.
- This identifies the queried API provider and returned feature state. It does **not** establish the software release deployed by every active producer.
- `get_block_info` returned `schedule_version=2147483648` for the sampled Savanna-era blocks, while `get_producer_schedule` returned active schedule version `2526`. Do not conflate these fields; their relationship needs source-level confirmation before treating them as a discrepancy.

## Security Interpretation

1. The live permission graph has a concrete 15-of-21 path to `eosio@active`, not merely a generic illustrative 15-of-21 example.
2. `eosio.wrap` and `eosio.msig` are currently privileged, and their account permissions delegate to `eosio@active`. The `eosio.wrap` ABI exposes `exec`. Consequently the wrapper account-level authorization surface is currently reachable through the observed 15-of-21 path.
3. The upstream Antelope reference repository describes `eosio.wrap::exec` as a privileged transaction wrapper; its source requires authorization from the wrapper and an `executer`, then sends the wrapped actions. The deployed code hash has not been matched to a reproducible upstream build, so the source-specific inner-action behavior remains unverified for this exact deployment.
4. These facts materially weaken any claim that an ordinary contract-only AEGIS deployment would be protected from a 15-of-21 producer coalition. They do not establish that AEGIS is deployed or that every contract table can be overwritten without authorized code execution.
5. Permission roots do not alone enumerate the exact permission level required by every ABI action, native action, privileged intrinsic, migration hook, or validator software upgrade. Avoid converting this snapshot into a blanket “15 BPs can do anything” assertion.

## Remaining P0 Evidence

- Obtain an atomic account/permission/code/ABI/feature/schedule snapshot at one named LIB from a trusted archival/state-history source, with a reproducible capture script and hashes.
- Match on-chain `eosio`, `eosio.msig`, and `eosio.wrap` code hashes to exact released or reproducibly built WASM artifacts; inspect the deployed bytes where no match exists.
- Enumerate active `eosio.msig` proposals and trace the exact authorizations for `setcode`, `setabi`, `updateauth`, `setpriv`, system parameter changes, producer schedule changes, wrapper execution, and relevant host intrinsics.
- Identify the exact Vaulta/Spring source commit and software versions operated by the active producers; the API provider version is not a substitute.
- Replay the relevant actions at the captured state and test whether 8/21, 11/21, 15/21, or 21/21 can execute each path.
- Reconcile Savanna-era schedule version fields against the matching source release.

## Reproduction

These are read-only Chain API calls; outputs should be saved with timestamps and response headers in a future reproducible capture:

```sh
curl -sS -H 'Content-Type: application/json' -d '{}' https://vaulta.greymass.com/v1/chain/get_info
curl -sS -H 'Content-Type: application/json' -d '{"account_name":"eosio"}' https://vaulta.greymass.com/v1/chain/get_account
curl -sS -H 'Content-Type: application/json' -d '{"account_name":"eosio.prods"}' https://vaulta.greymass.com/v1/chain/get_account
curl -sS -H 'Content-Type: application/json' -d '{"account_name":"eosio.msig"}' https://vaulta.greymass.com/v1/chain/get_account
curl -sS -H 'Content-Type: application/json' -d '{"account_name":"eosio.wrap"}' https://vaulta.greymass.com/v1/chain/get_account
curl -sS -H 'Content-Type: application/json' -d '{}' https://vaulta.greymass.com/v1/chain/get_producer_schedule
```

Primary references: [Vaulta Chain API](https://docs.eosnetwork.com/apis/spring/latest/chain.api/), [Vaulta API-node documentation](https://docs.eosnetwork.com/docs/latest/node-operation/api-node/), [Vaulta system-contract repository](https://github.com/VaultaFoundation/system-contracts), [Antelope reference-contract repository](https://github.com/AntelopeIO/reference-contracts), and the [`eosio.wrap` source](https://github.com/AntelopeIO/reference-contracts/blob/main/contracts/eosio.wrap/src/eosio.wrap.cpp). Upstream source is not proof of source identity for the deployed code hashes above.
